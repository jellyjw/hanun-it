import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@/utils/supabase/server';
import { RSS_SOURCES } from '@/utils/constants';
import { extractThumbnailFromUrl } from '@/lib/thumbnailExtractor';
import { processArticleContent } from '@/utils/markdown';
import { ArticleSummarizer } from '@/lib/summarizer/summarizer';

const parser = new Parser({
  customFields: {
    item: [
      'content:encoded',
      'content',
      'media:content',
      'media:thumbnail',
      'enclosure',
    ],
  },
});

// RSS 아이템에서 직접 이미지 URL 추출
function extractImageFromRssItem(item: any): string | null {
  // enclosure 태그 - rss-parser는 { url, type, length } 객체로 파싱
  if (item.enclosure) {
    const enclosure = item.enclosure;
    const url = enclosure.url || enclosure.$?.url || enclosure;
    const type = enclosure.type || '';

    if (typeof url === 'string' && url.startsWith('http')) {
      if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)/i.test(url) || url.includes('image')) {
        return url;
      }
    }
  }

  // itunes:image 태그
  if (item['itunes:image']) {
    const itunesImage = item['itunes:image'];
    const url = itunesImage?.href || itunesImage?.$?.href || itunesImage;
    if (typeof url === 'string' && url.startsWith('http')) {
      return url;
    }
  }

  // media:content 태그
  if (item['media:content']) {
    const media = item['media:content'];
    const url = media?.$?.url || media?.url || media;
    if (typeof url === 'string' && url.startsWith('http')) {
      return url;
    }
  }

  // media:thumbnail 태그
  if (item['media:thumbnail']) {
    const thumb = item['media:thumbnail'];
    const url = thumb?.$?.url || thumb?.url || thumb;
    if (typeof url === 'string' && url.startsWith('http')) {
      return url;
    }
  }

  // content 내의 첫 번째 img 태그
  const content = item['content:encoded'] || item.content || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  return null;
}

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

    // AI 요약 기능 활성화 여부 (환경 변수)
    const enableAI = process.env.ENABLE_AI_SUMMARIZATION !== 'false';
    const openaiKey = process.env.OPENAI_API_KEY || '';

    // Summarizer 인스턴스 생성 (활성화된 경우)
    let summarizer: ArticleSummarizer | null = null;
    if (enableAI && openaiKey) {
      try {
        summarizer = new ArticleSummarizer(openaiKey);
        console.log('✅ AI Summarization enabled');
      } catch (error) {
        console.warn('⚠️ Failed to initialize summarizer:', error);
      }
    } else {
      console.log('ℹ️ AI Summarization disabled');
    }

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

              // 썸네일 추출: RSS에서 먼저 시도, 없으면 페이지 크롤링
              let thumbnailUrl: string | null = null;

              // RSS 아이템에서 직접 이미지 추출 시도
              thumbnailUrl = extractImageFromRssItem(item);

              // 2. RSS에서 못 찾으면 페이지 크롤링으로 fallback
              if (!thumbnailUrl) {
                try {
                  thumbnailUrl = await Promise.race([
                    extractThumbnailFromUrl(item.link),
                    new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)) // 3초 타임아웃
                  ]);
                } catch (error) {
                  console.warn(`썸네일 추출 실패 (${item.link}):`, error);
                }
              }

              // AI 요약 생성
              let aiSummary = null;
              if (summarizer && articleContent && articleContent.length > 100) {
                try {
                  aiSummary = await summarizer.summarizeArticle(articleContent, item.title || '');
                  if (aiSummary) {
                    console.log(`✅ 요약 생성: ${item.title?.substring(0, 30)}...`);
                  }
                } catch (error) {
                  console.warn(`⚠️ 요약 실패 (${item.title?.substring(0, 30)}):`, error);
                  // Fallback to RSS summary
                }
              }

              return {
                title: item.title || '',
                description: item.contentSnippet || '',
                summary: aiSummary || item.summary || '',
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
