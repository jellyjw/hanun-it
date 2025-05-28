import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isDomestic = searchParams.get("domestic");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // 국내 아티클과 번역된 해외 아티클을 합쳐서 조회하는 쿼리 작성
    let articlesData = [];
    let totalCount = 0;

    if (isDomestic === "true") {
      // 국내 아티클만 조회
      let countQuery = supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("is_domestic", true);

      if (category && category !== "all") {
        countQuery = countQuery.eq("category", category);
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      let dataQuery = supabase
        .from("articles")
        .select("*")
        .eq("is_domestic", true)
        .order("pub_date", { ascending: false });

      if (category && category !== "all") {
        dataQuery = dataQuery.eq("category", category);
      }

      dataQuery = dataQuery.range(offset, offset + limit - 1);

      const { data: articles, error } = await dataQuery;
      if (error) throw error;

      articlesData = articles || [];
      totalCount = count || 0;
    } else if (isDomestic === "false") {
      // 번역된 해외 아티클만 조회
      let countQuery = supabase
        .from("translated_articles")
        .select("*", { count: "exact", head: true });

      if (category && category !== "all") {
        countQuery = countQuery.eq("category", category);
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      let dataQuery = supabase
        .from("translated_articles")
        .select("*")
        .order("pub_date", { ascending: false });

      if (category && category !== "all") {
        dataQuery = dataQuery.eq("category", category);
      }

      dataQuery = dataQuery.range(offset, offset + limit - 1);

      const { data: translatedArticles, error } = await dataQuery;
      if (error) throw error;

      // translated_articles의 구조를 articles와 맞춤
      articlesData = (translatedArticles || []).map((article) => ({
        ...article,
        is_domestic: false,
        is_translated: true,
      }));
      totalCount = count || 0;
    } else {
      // 전체 조회: 국내 아티클 + 번역된 해외 아티클

      // 1. 국내 아티클 조회
      let domesticCountQuery = supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("is_domestic", true);

      if (category && category !== "all") {
        domesticCountQuery = domesticCountQuery.eq("category", category);
      }

      const { count: domesticCount, error: domesticCountError } =
        await domesticCountQuery;
      if (domesticCountError) throw domesticCountError;

      // 2. 번역된 해외 아티클 조회
      let translatedCountQuery = supabase
        .from("translated_articles")
        .select("*", { count: "exact", head: true });

      if (category && category !== "all") {
        translatedCountQuery = translatedCountQuery.eq("category", category);
      }

      const { count: translatedCount, error: translatedCountError } =
        await translatedCountQuery;
      if (translatedCountError) throw translatedCountError;

      totalCount = (domesticCount || 0) + (translatedCount || 0);

      // 페이지네이션을 위한 데이터 조회
      // 모든 아티클을 pub_date 순으로 정렬하여 조회
      const allArticles = [];

      // 국내 아티클 조회
      let domesticQuery = supabase
        .from("articles")
        .select("*")
        // .eq("is_domestic", true)
        .order("pub_date", { ascending: false });

      if (category && category !== "all") {
        domesticQuery = domesticQuery.eq("category", category);
      }

      const { data: domesticArticles, error: domesticError } =
        await domesticQuery;
      if (domesticError) throw domesticError;

      // 번역된 해외 아티클 조회
      let translatedQuery = supabase
        .from("translated_articles")
        .select("*")
        .order("pub_date", { ascending: false });

      if (category && category !== "all") {
        translatedQuery = translatedQuery.eq("category", category);
      }

      const { data: translatedArticles, error: translatedError } =
        await translatedQuery;
      if (translatedError) throw translatedError;

      // 두 배열을 합치고 날짜순으로 정렬
      const combinedArticles = [
        ...(domesticArticles || []),
        ...(translatedArticles || []).map((article) => ({
          ...article,
          is_domestic: false,
          is_translated: true,
        })),
      ].sort(
        (a, b) =>
          new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime()
      );

      // 페이지네이션 적용
      articlesData = combinedArticles.slice(offset, offset + limit);
    }

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      articles: articlesData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("아티클 조회 중 오류:", error);
    return NextResponse.json(
      { success: false, error: "아티클 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
