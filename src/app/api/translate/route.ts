import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ArticleTranslator } from "@/lib/translator/translator";

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();

    if (!process.env.DEEPL_API_KEY) {
      throw new Error("DeepL API key not configured");
    }

    const supabase = await createClient();
    const translator = new ArticleTranslator(process.env.DEEPL_API_KEY);

    // 원본 아티클 조회
    const { data: article, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", articleId)
      .eq("is_domestic", false) // 해외 아티클만
      .single();

    if (error || !article) {
      return NextResponse.json(
        { success: false, error: "아티클을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 이미 번역된 아티클인지 확인
    const { data: existingTranslation } = await supabase
      .from("translated_articles")
      .select("*")
      .eq("original_article_id", articleId)
      .single();

    if (existingTranslation) {
      return NextResponse.json({
        success: true,
        message: "이미 번역된 아티클입니다.",
        translatedArticle: existingTranslation,
      });
    }

    // 번역 실행
    const translatedContent = await translator.translateArticle({
      title: article.title,
      content: article.content || article.description,
      description: article.description,
    });

    // 번역된 아티클 저장
    const translatedArticle = {
      original_article_id: article.id,
      title: translatedContent.title,
      description: translatedContent.description,
      content: translatedContent.content,
      link: article.link,
      pub_date: article.pub_date,
      source_name: `${article.source_name} (번역)`,
      source_url: article.source_url,
      category: article.category,
      is_domestic: false,
      is_translated: true,
      thumbnail: article.thumbnail,
      original_language: "EN",
      translated_language: "KO",
    };

    const { data: savedTranslation, error: saveError } = await supabase
      .from("translated_articles")
      .insert(translatedArticle)
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    return NextResponse.json({
      success: true,
      message: "번역이 완료되었습니다.",
      translatedArticle: savedTranslation,
    });
  } catch (error) {
    console.error("번역 중 오류:", error);
    return NextResponse.json(
      { success: false, error: "번역 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
