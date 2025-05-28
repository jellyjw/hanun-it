import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ArticleTranslator } from "@/lib/translator/translator";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DEEPL_API_KEY) {
      throw new Error("DeepL API key not configured");
    }

    const supabase = await createClient();
    const translator = new ArticleTranslator(process.env.DEEPL_API_KEY);

    // 최근 7일간의 해외 아티클 중 번역되지 않은 것들 조회
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: articles, error } = await supabase
      .from("articles")
      .select("*")
      .eq("is_domestic", false)
      .gte("pub_date", sevenDaysAgo.toISOString())
      .order("pub_date", { ascending: false })
      .limit(2); // 주 1회 2개 제한

    if (error) {
      throw error;
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "번역할 새로운 아티클이 없습니다.",
        translated: 0,
      });
    }

    const translatedArticles = [];

    for (const article of articles) {
      try {
        // 이미 번역된 아티클인지 확인
        const { data: existingTranslation } = await supabase
          .from("translated_articles")
          .select("id")
          .eq("original_article_id", article.id)
          .single();

        if (existingTranslation) {
          console.log(`아티클 ${article.id}는 이미 번역됨`);
          continue;
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
          console.error(`아티클 ${article.id} 저장 실패:`, saveError);
          continue;
        }

        translatedArticles.push(savedTranslation);
        console.log(`✅ 아티클 번역 완료: ${article.title}`);

        // API 호출 간격 조절 (DeepL 무료 티어 제한 고려)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`아티클 ${article.id} 번역 실패:`, error);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${translatedArticles.length}개의 아티클이 번역되었습니다.`,
      translated: translatedArticles.length,
      articles: translatedArticles,
    });
  } catch (error) {
    console.error("자동 번역 중 오류:", error);
    return NextResponse.json(
      { success: false, error: "자동 번역 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
