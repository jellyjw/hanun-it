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
      countQuery = countQuery.eq("category", category);
    }

    if (isDomestic !== null) {
      countQuery = countQuery.eq("is_domestic", isDomestic === "true");
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

    // 실제 데이터 조회
    let dataQuery = supabase
      .from("articles")
      .select("*")
      .order("pub_date", { ascending: false })
      .range(offset, offset + limit - 1);

    // 필터 적용
    if (category && category !== "all") {
      dataQuery = dataQuery.eq("category", category);
    }

    if (isDomestic !== null) {
      dataQuery = dataQuery.eq("is_domestic", isDomestic === "true");
    }

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
