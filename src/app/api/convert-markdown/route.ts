// src/app/api/articles/convert-markdown/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { detectContentType, processArticleContent } from '@/utils/markdown';

export async function POST() {
  try {
    const supabase = await createClient();

    // 모든 아티클 조회 (배치로 처리)
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, content, title')
      .not('content', 'is', null)
      .limit(100); // 한 번에 100개씩 처리

    if (error) throw error;

    let convertedCount = 0;
    let errorCount = 0;

    for (const article of articles || []) {
      try {
        const contentType = detectContentType(article.content);

        if (contentType === 'markdown') {
          console.log(`마크다운 변환 중: ${article.title}`);
          const convertedContent = processArticleContent(article.content);

          const { error: updateError } = await supabase
            .from('articles')
            .update({ content: convertedContent })
            .eq('id', article.id);

          if (!updateError) {
            convertedCount++;
            console.log(`✅ 변환 완료: ${article.title}`);
          } else {
            console.error(`❌ 업데이트 실패: ${article.title}`, updateError);
            errorCount++;
          }
        }
      } catch (error) {
        console.error(`❌ 처리 중 오류: ${article.title}`, error);
        errorCount++;
      }

      // API 호출 간격 조절 (과부하 방지)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      message: `${convertedCount}개의 마크다운 아티클을 변환했습니다. (오류: ${errorCount}개)`,
      converted: convertedCount,
      errors: errorCount,
      total: articles?.length || 0,
    });
  } catch (error) {
    console.error('마크다운 변환 중 오류:', error);
    return NextResponse.json({ success: false, error: '마크다운 변환 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
