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

    // 먼저 총 개수를 조회
    let countQuery = supabase
      .from("articles")
      .select("*", { count: "exact", head: true });

    // 필터 적용 (count 쿼리에도 동일하게 적용)
    if (category && category !== "all") {
      if (category === "domestic") {
        countQuery = countQuery.eq("is_domestic", true);
      } else if (category === "foreign") {
        countQuery = countQuery.eq("is_domestic", false);
      } else if (category === "weekly") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        countQuery = countQuery.gte("pub_date", sevenDaysAgo.toISOString());
      } else {
        countQuery = countQuery.eq("category", category);
      }
    }

    // 기존 domestic 파라미터 지원 (하위 호환성)
    if (
      isDomestic !== null &&
      category !== "domestic" &&
      category !== "foreign"
    ) {
      countQuery = countQuery.eq("is_domestic", isDomestic === "true");
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

    // 실제 데이터 조회
    let dataQuery = supabase.from("articles").select("*");

    // 정렬 기준 설정
    if (category === "weekly") {
      // 주간 인기: 조회수 내림차순, 그 다음 발행일 내림차순
      dataQuery = dataQuery
        .order("view_count", { ascending: false, nullsFirst: false })
        .order("pub_date", { ascending: false });
    } else {
      // 기본: 발행일 내림차순
      dataQuery = dataQuery.order("pub_date", { ascending: false });
    }

    // 필터 적용
    if (category && category !== "all") {
      if (category === "domestic") {
        dataQuery = dataQuery.eq("is_domestic", true);
      } else if (category === "foreign") {
        dataQuery = dataQuery.eq("is_domestic", false);
      } else if (category === "weekly") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        dataQuery = dataQuery.gte("pub_date", sevenDaysAgo.toISOString());
      } else {
        dataQuery = dataQuery.eq("category", category);
      }
    }

    // 기존 domestic 파라미터 지원 (하위 호환성)
    if (
      isDomestic !== null &&
      category !== "domestic" &&
      category !== "foreign"
    ) {
      dataQuery = dataQuery.eq("is_domestic", isDomestic === "true");
    }

    dataQuery = dataQuery.range(offset, offset + limit - 1);

    const { data: articles, error } = await dataQuery;

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      articles,
      pagination: {
        page,
        limit,
        total: count || 0,
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
