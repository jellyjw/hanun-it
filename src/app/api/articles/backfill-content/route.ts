import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Parser from 'rss-parser';
import { processArticleContent } from '@/utils/markdown';

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'content'],
  },
});

export async function POST(request: NextRequest) {
  // 1. 관리자 인증
  const supabase = await createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',');
  const isAdmin = user && adminEmails.includes(user.email || '');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('데이터 마이그레이션 시작: 전체 아티클 본문 채우기');

  try {
    // 2. 모든 고유 RSS 소스 URL 가져오기
    const { data: sources, error: sourcesError } = await supabase
      .from('articles')
      .select('source_url')
      .neq('source_url', null);

    if (sourcesError) throw sourcesError;

    const uniqueSourceUrls = [...new Set(sources.map((s) => s.source_url))];
    console.log(`${uniqueSourceUrls.length}개의 고유 RSS 소스를 찾았습니다.`);

    let totalUpdatedCount = 0;

    // 3. 각 소스별로 마이그레이션 진행
    for (const sourceUrl of uniqueSourceUrls) {
      if (!sourceUrl) continue;

      try {
        console.log(`처리 중인 RSS 피드: ${sourceUrl}`);
        const feed = await parser.parseURL(sourceUrl);

        // 4. 최신 아티클 본문 맵 생성 (링크 -> 본문)
        const contentMap = new Map<string, string>();
        for (const item of feed.items) {
          if (item.link) {
            const fullContent = (item as any)['content:encoded'] || item.content || '';
            contentMap.set(item.link, fullContent);
          }
        }

        // 5. DB에서 해당 소스의 아티클들 가져오기
        const { data: articlesToUpdate, error: articlesError } = await supabase
          .from('articles')
          .select('id, link, content')
          .eq('source_url', sourceUrl);

        if (articlesError) throw articlesError;

        const updatePromises = [];
        let sourceUpdatedCount = 0;

        // 6. 본문 업데이트 필요한 경우 Promise 배열에 추가
        for (const article of articlesToUpdate) {
          const newContent = contentMap.get(article.link);
          // 새 본문이 있고, 기존 본문과 다를 경우에만 업데이트
          if (newContent && newContent.length > (article.content || '').length) {
            const processedNewContent = processArticleContent(newContent);
            updatePromises.push(
              supabase.from('articles').update({ content: processedNewContent }).eq('id', article.id)
            );
            sourceUpdatedCount++;
          }
        }

        // 7. 병렬로 업데이트 실행
        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
          console.log(`✅ [${feed.title}] ${sourceUpdatedCount}개 아티클 본문 업데이트 완료.`);
          totalUpdatedCount += sourceUpdatedCount;
        }
      } catch (feedError) {
        console.error(`피드 처리 실패 (${sourceUrl}):`, feedError);
        continue; // 한 피드가 실패해도 다음 피드로 계속 진행
      }
    }

    const message = `마이그레이션 완료. 총 ${totalUpdatedCount}개의 아티클 본문을 업데이트했습니다.`;
    console.log(message);
    return NextResponse.json({ success: true, message, totalUpdatedCount });

  } catch (error) {
    console.error('데이터 마이그레이션 중 심각한 오류 발생:', error);
    return NextResponse.json(
      { success: false, error: '마이그레이션 실패', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
