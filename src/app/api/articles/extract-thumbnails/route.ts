import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// 썸네일 추출 함수
async function extractThumbnail(url: string): Promise<string | null> {
  try {
    const response = await fetch("/api/extract-thumbnail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) return null;

    const result = await response.json();
    return result.thumbnail || null;
  } catch (error) {
    console.error(`썸네일 추출 실패 (${url}):`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50"); // 한 번에 처리할 개수

    console.log(`썸네일 일괄 추출 시작 (최대 ${limit}개)`);

    // 썸네일이 없는 아티클들을 가져오기
    const { data: articles, error } = await supabase
      .from("articles")
      .select("id, title, link, thumbnail")
      .or("thumbnail.is.null,thumbnail.eq.")
      .not("link", "is", null)
      .limit(limit);

    if (error) {
      throw error;
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "처리할 아티클이 없습니다.",
        processed: 0,
        extracted: 0,
      });
    }

    console.log(`${articles.length}개 아티클의 썸네일 추출 시작`);

    let extracted = 0;
    const results = [];

    for (const article of articles) {
      try {
        console.log(`썸네일 추출 중: ${article.title}`);

        const thumbnail = await extractThumbnail(article.link);

        if (thumbnail) {
          // 썸네일이 추출되면 DB 업데이트
          const { error: updateError } = await supabase
            .from("articles")
            .update({ thumbnail })
            .eq("id", article.id);

          if (!updateError) {
            extracted++;
            results.push({
              id: article.id,
              title: article.title,
              thumbnail,
              success: true,
            });
            console.log(`썸네일 추출 성공: ${article.title}`);
          } else {
            console.error(`DB 업데이트 실패 (${article.title}):`, updateError);
            results.push({
              id: article.id,
              title: article.title,
              success: false,
              error: "DB 업데이트 실패",
            });
          }
        } else {
          results.push({
            id: article.id,
            title: article.title,
            success: false,
            error: "썸네일 추출 실패",
          });
        }

        // 요청 간 간격 (서버 부하 방지)
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`처리 중 오류 (${article.title}):`, error);
        results.push({
          id: article.id,
          title: article.title,
          success: false,
          error: error instanceof Error ? error.message : "알 수 없는 오류",
        });
      }
    }

    console.log(`썸네일 일괄 추출 완료: ${extracted}/${articles.length}`);

    return NextResponse.json({
      success: true,
      message: `${articles.length}개 아티클 중 ${extracted}개의 썸네일을 추출했습니다.`,
      processed: articles.length,
      extracted,
      results,
    });
  } catch (error) {
    console.error("썸네일 일괄 추출 중 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "썸네일 일괄 추출 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
