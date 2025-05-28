import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const { data: article, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", params.id)
      .single();

    if (article) {
      // // 해외 아티클인 경우, 번역된 버전이 있는지 확인
      // if (!article.is_domestic) {
      //   const { data: translatedArticle } = await supabase
      //     .from("translated_articles")
      //     .select("*")
      //     .eq("original_article_id", params.id)
      //     .single();

      //   if (translatedArticle) {
      //     // 번역된 버전이 있으면 번역된 버전을 반환
      //     return NextResponse.json({
      //       success: true,
      //       article: {
      //         ...translatedArticle,
      //         is_domestic: false,
      //         is_translated: true,
      //       },
      //     });
      //   } else {
      //     // 번역되지 않은 해외 아티클은 접근 불가
      //     return NextResponse.json(
      //       { success: false, error: "번역되지 않은 해외 아티클입니다." },
      //       { status: 403 }
      //     );
      //   }
      // }

      // 국내 아티클은 그대로 반환
      return NextResponse.json({
        success: true,
        article,
      });
    }

    // articles 테이블에 없으면 translated_articles 테이블에서 직접 조회
    const { data: translatedArticle, error: translatedError } = await supabase
      .from("translated_articles")
      .select("*")
      .eq("id", params.id)
      .single();

    if (translatedError || !translatedArticle) {
      return NextResponse.json(
        { success: false, error: "아티클을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article: {
        ...translatedArticle,
        is_domestic: false,
        is_translated: true,
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
