import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // view_count가 null인 모든 아티클을 0으로 업데이트
    const { data, error } = await supabase
      .from("articles")
      .update({ view_count: 0 })
      .is("view_count", null)
      .select("id");

    if (error) {
      console.error("마이그레이션 실패:", error);
      return NextResponse.json(
        { success: false, error: "마이그레이션에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${data?.length || 0}개의 아티클 조회수를 초기화했습니다.`,
      updated: data?.length || 0,
    });
  } catch (error) {
    console.error("마이그레이션 중 오류:", error);
    return NextResponse.json(
      { success: false, error: "마이그레이션 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
