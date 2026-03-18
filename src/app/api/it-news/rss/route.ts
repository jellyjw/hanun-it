import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@/utils/supabase/server';
import { processArticleContent } from '@/utils/markdown';
import { createClient as createServiceRoleClient } from '@supabase/supabase-js';
import { checkIsAdmin } from '@/lib/admin';

type CustomFeed = {
  title: string;
  description: string;
  items: CustomItem[];
};

type CustomItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  originContent?: string;
  enclosure?: {
    url?: string;
  };
  image?: {
    url?: string;
  };
};

// Parser 인스턴스 생성 시 customFields 설정
const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: [['content:encoded', 'originContent']],
  },
});

// 관리자 권한 확인 함수
async function checkAdminPermission(): Promise<boolean> {
  const supabase = await createClient();
  return checkIsAdmin(supabase);
}

// 썸네일 추출 함수
async function extractThumbnail(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃

    // 내부 API 호출을 위한 절대 URL 구성
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:7007';
    const apiUrl = `${host}/api/extract-thumbnail`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`썸네일 추출 API 응답 오류 (${response.status}): ${response.statusText}`);
      return null;
    }

    const result = await response.json();
    return result.thumbnail || null;
  } catch (error) {
    console.error(`썸네일 추출 실패 (${url}):`, error);
    return null;
  }
}

// 배치로 썸네일 추출 (병렬 처리)
async function extractThumbnailsBatch(
  newsItems: Array<{ link: string; title: string }>,
  batchSize = 3,
): Promise<Map<string, string>> {
  const thumbnailMap = new Map<string, string>();

  for (let i = 0; i < newsItems.length; i += batchSize) {
    const batch = newsItems.slice(i, i + batchSize);
    console.log(
      `배치 ${Math.floor(i / batchSize) + 1}/${Math.ceil(newsItems.length / batchSize)}: ${batch.length}개 IT 뉴스 썸네일 추출 중...`,
    );

    const promises = batch.map(async (newsItem) => {
      try {
        const thumbnail = await extractThumbnail(newsItem.link);
        if (thumbnail) {
          thumbnailMap.set(newsItem.link, thumbnail);
          console.log(`✓ 썸네일 추출 성공: ${newsItem.title}`);
        }
        return { link: newsItem.link, thumbnail };
      } catch (error) {
        console.error(`✗ 썸네일 추출 실패: ${newsItem.title}`, error);
        return { link: newsItem.link, thumbnail: null };
      }
    });

    await Promise.all(promises);

    // 배치 간 간격 (서버 부하 방지)
    if (i + batchSize < newsItems.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return thumbnailMap;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    const isCron = authHeader === `Bearer ${cronSecret}`;
    const isAdmin = await checkAdminPermission();

    if (!isCron && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: '관리자 권한이 필요합니다.',
        },
        { status: 403 },
      );
    }

    // RLS를 우회하기 위해 서비스 역할 클라이언트 사용
    const supabase = await createClient();

    // IT 뉴스 RSS 소스 조회
    const { data: rssSources, error: rssError } = await supabase
      .from('it_news_rss_sources')
      .select('*')
      .eq('is_active', true);

    if (rssError) {
      console.error('RSS 소스 조회 오류:', rssError);
      throw rssError;
    }

    if (!rssSources || rssSources.length === 0) {
      return NextResponse.json({
        success: false,
        error: '활성화된 IT 뉴스 RSS 소스가 없습니다.',
      });
    }

    console.log(`🔍 ${rssSources.length}개의 활성화된 RSS 소스 발견`);

    const newsItems = [];
    let totalProcessed = 0;
    let thumbnailsExtracted = 0;

    // 1단계: RSS 수집 및 기본 정보 저장
    const newsForThumbnailExtraction: Array<{ link: string; title: string }> = [];

    for (const source of rssSources) {
      try {
        console.log(`📡 IT 뉴스 RSS 수집 시작: ${source.name}`);
        const feed = await parser.parseURL(source.url);
        console.log(`📄 ${feed.items.length}개 IT 뉴스 발견: ${source.name}`);

        for (const item of feed.items) {
          totalProcessed++;

          // RSS에서 제공하는 이미지 먼저 확인
          let thumbnailUrl = '';

          // 1순위: RSS enclosure 또는 image 필드
          if (item.enclosure?.url) {
            thumbnailUrl = item.enclosure.url;
          } else if (item.image?.url) {
            thumbnailUrl = item.image.url;
          }

          // 2순위: content에서 첫 번째 이미지 추출 시도
          if (!thumbnailUrl && (item.content || item.originContent)) {
            const content = item.originContent || item.content || '';
            const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) {
              thumbnailUrl = imgMatch[1];
            }
          }

          // 상대 URL을 절대 URL로 변환
          if (thumbnailUrl && !thumbnailUrl.startsWith('http') && item.link) {
            try {
              const baseUrl = new URL(item.link);
              thumbnailUrl = new URL(thumbnailUrl, baseUrl.origin).href;
            } catch {
              thumbnailUrl = '';
            }
          }

          const newsItem = {
            title: item.title || '',
            description: item.contentSnippet || item.content || '',
            summary: item.content || '',
            content: processArticleContent(item.originContent || item.content || ''),
            link: item.link || '',
            pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            source_name: source.name,
            source_url: source.url,
            category: source.category,
            thumbnail: thumbnailUrl,
            view_count: 0,
            comment_count: 0,
          };

          // 썸네일이 없고 링크가 있는 경우 나중에 추출하기 위해 별도 배열에 저장
          if (!thumbnailUrl && item.link) {
            newsForThumbnailExtraction.push({
              link: item.link,
              title: item.title || '',
            });
          }

          // 중복 체크 후 삽입
          console.log(`💾 뉴스 아이템 삽입 시도: ${item.title}`);
          const { data, error } = await supabase.from('it_news').upsert(newsItem, {
            onConflict: 'link',
            ignoreDuplicates: false, // 업데이트도 허용
          });

          if (!error) {
            newsItems.push(newsItem);
            console.log(`✅ DB 삽입 성공: ${item.title}`);
          } else {
            console.error(`❌ DB 삽입 실패 (${item.title}):`, error);
          }
        }

        // RSS 소스 마지막 수집 시간 업데이트
        await supabase
          .from('it_news_rss_sources')
          .update({
            last_fetched: new Date().toISOString(),
          })
          .eq('id', source.id);

        console.log(`✅ IT 뉴스 RSS 수집 완료: ${source.name}`);
      } catch (error) {
        console.error(`❌ IT 뉴스 RSS 수집 실패 (${source.name}):`, error);
        continue;
      }
    }

    // 2단계: 썸네일이 없는 새 뉴스들의 썸네일 배치 추출
    if (newsForThumbnailExtraction.length > 0) {
      console.log(`🖼️  ${newsForThumbnailExtraction.length}개 IT 뉴스의 썸네일 배치 추출 시작...`);

      const thumbnailMap = await extractThumbnailsBatch(newsForThumbnailExtraction, 5);

      // 추출된 썸네일로 DB 업데이트
      for (const [link, thumbnail] of thumbnailMap.entries()) {
        const { error } = await supabase.from('it_news').update({ thumbnail }).eq('link', link);

        if (!error) {
          thumbnailsExtracted++;
        }
      }
    }

    console.log(`🎉 총 ${newsItems.length}개의 새로운 IT 뉴스 수집 완료!`);

    return NextResponse.json({
      success: true,
      message: `${newsItems.length}개의 새로운 IT 뉴스를 수집했습니다. (썸네일 ${thumbnailsExtracted}개 추출)`,
      articles: newsItems.length,
      totalProcessed,
      thumbnailsExtracted,
      breakdown: {
        newNews: newsItems.length,
        newThumbnails: thumbnailsExtracted,
      },
    });
  } catch (error) {
    console.error('❌ IT 뉴스 RSS 수집 중 오류:', error);
    return NextResponse.json({ success: false, error: 'IT 뉴스 RSS 수집 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
