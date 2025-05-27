import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params; // params를 await 해야 함
    const supabase = await createClient();

    const { data: article, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (!article) {
      return NextResponse.json(
        { success: false, error: "아티클을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article,
    });
  } catch (error) {
    console.error("아티클 조회 중 오류:", error);
    return NextResponse.json(
      { success: false, error: "아티클 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
