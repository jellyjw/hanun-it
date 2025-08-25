import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@/utils/supabase/server';
import { RSS_SOURCES } from '@/utils/constants';
import { extractThumbnailFromUrl } from '@/lib/thumbnailExtractor';
import { processArticleContent } from '@/utils/markdown';

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'content'],
  },
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',');
    const isAdmin = user && adminEmails.includes(user.email || '');

    const authHeader = request.headers.get('authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isAdmin && !isCron) {
      return new Response('Unauthorized', { status: 401 });
    }

    let totalArticlesProcessed = 0;
    const BATCH_SIZE = 5;

    // RSS 소스를 5개씩 배치로 처리
    for (let i = 0; i < RSS_SOURCES.length; i += BATCH_SIZE) {
      const batch = RSS_SOURCES.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(async (source) => {
          try {
            const feed = await parser.parseURL(source.url);

            // 썸네일 추출을 위한 Promise들을 수집하되, 실패해도 계속 진행
            const articlePromises = feed.items.map(async (item: any) => {
              if (!item.link) return null;

              const articleContent = item['content:encoded'] || item.content || '';
              
              // 썸네일 추출을 별도로 처리 (타임아웃 단축)
              let thumbnailUrl = null;
              try {
                thumbnailUrl = await Promise.race([
                  extractThumbnailFromUrl(item.link),
                  new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)) // 3초 타임아웃
                ]);
              } catch (error) {
                console.warn(`썸네일 추출 실패 (${item.link}):`, error);
              }

              return {
                title: item.title || '',
                description: item.contentSnippet || '',
                summary: item.summary || '',
                content: processArticleContent(articleContent),
                link: item.link,
                pub_date: item.pubDate ? new Date(item.pubDate) : new Date(),
                source_name: source.name,
                source_url: source.url,
                category: source.category,
                is_domestic: source.isDomestic,
                thumbnail: thumbnailUrl,
              };
            });

            const articles = await Promise.all(articlePromises);
            const validArticles = articles.filter(Boolean);

            if (validArticles.length > 0) {
              const { error } = await supabase.from('articles').upsert(validArticles, {
                onConflict: 'link',
              });
              if (error) {
                console.error(`DB 저장 실패 (${source.name}):`, error);
              } else {
                totalArticlesProcessed += validArticles.length;
                console.log(`배치 처리 완료: ${source.name} (${validArticles.length}개)`);
              }
            }
          } catch (error) {
            console.error(`RSS 피드 처리 실패 (${source.name}):`, error);
          }
        })
      );

      // 배치 간 잠깐 대기 (서버 부하 방지)
      if (i + BATCH_SIZE < RSS_SOURCES.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      message: `총 ${totalArticlesProcessed}개의 아티클을 처리했습니다.`,
    });
  } catch (error) {
    console.error('[API Error] /api/rss:', error);
    return NextResponse.json(
      {
        message: '서버 내부 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
