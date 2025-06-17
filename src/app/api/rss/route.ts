import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@/utils/supabase/server';
import { RSS_SOURCES } from '@/utils/constants';
import { processArticleContent } from '@/utils/markdown';

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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  // 환경변수에서 관리자 이메일 목록 가져오기 (쉼표로 구분)
  const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'greenery.dev@gmail.com,admin@hanunit.com';
  const adminEmails = adminEmailsEnv.split(',').map((email) => email.trim());

  // 사용자 메타데이터에서 role 확인 또는 이메일 기반 확인
  const userRole = user.user_metadata?.role;
  const userEmail = user.email;

  return userRole === 'admin' || Boolean(userEmail && adminEmails.includes(userEmail));
}

// 개선된 썸네일 추출 함수
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
  articles: Array<{ link: string; title: string }>,
  batchSize = 5,
): Promise<Map<string, string>> {
  const thumbnailMap = new Map<string, string>();

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    console.log(
      `괄호 ${Math.floor(i / batchSize) + 1}/${Math.ceil(articles.length / batchSize)}: ${batch.length}개 아티클 썸네일 추출 중...`,
    );

    const promises = batch.map(async (article) => {
      try {
        const thumbnail = await extractThumbnail(article.link);
        if (thumbnail) {
          thumbnailMap.set(article.link, thumbnail);
          console.log(`✓ 썸네일 추출 성공: ${article.title}`);
        }
        return { link: article.link, thumbnail };
      } catch (error) {
        console.error(`✗ 썸네일 추출 실패: ${article.title}`, error);
        return { link: article.link, thumbnail: null };
      }
    });

    await Promise.all(promises);

    // 배치 간 간격 (서버 부하 방지)
    if (i + batchSize < articles.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return thumbnailMap;
}

// 기존 아티클 썸네일 업데이트
async function updateExistingThumbnails(supabase: any, limit = 20): Promise<number> {
  try {
    // 썸네일이 없는 기존 아티클 가져오기
    const { data: articlesWithoutThumbnails, error } = await supabase
      .from('articles')
      .select('id, title, link, thumbnail')
      .or('thumbnail.is.null,thumbnail.eq.')
      .not('link', 'is', null)
      .limit(limit);

    if (error || !articlesWithoutThumbnails || articlesWithoutThumbnails.length === 0) {
      return 0;
    }

    console.log(`${articlesWithoutThumbnails.length}개 기존 아티클의 썸네일 업데이트 시도...`);

    const thumbnailMap = await extractThumbnailsBatch(
      articlesWithoutThumbnails.map((a: { link: string; title: string }) => ({ link: a.link, title: a.title })),
      3, // 기존 아티클 업데이트는 더 작은 배치 사이즈
    );

    let updatedCount = 0;
    for (const article of articlesWithoutThumbnails) {
      const thumbnail = thumbnailMap.get(article.link);
      if (thumbnail) {
        const { error: updateError } = await supabase.from('articles').update({ thumbnail }).eq('id', article.id);

        if (!updateError) {
          updatedCount++;
        }
      }
    }

    console.log(`기존 아티클 썸네일 업데이트 완료: ${updatedCount}/${articlesWithoutThumbnails.length}`);
    return updatedCount;
  } catch (error) {
    console.error('기존 아티클 썸네일 업데이트 중 오류:', error);
    return 0;
  }
}

export async function GET() {
  try {
    // 관리자 권한 확인
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: '관리자 권한이 필요합니다.',
        },
        { status: 403 },
      );
    }

    const supabase = await createClient();
    const articles = [];
    let totalProcessed = 0;
    let thumbnailsExtracted = 0;
    let existingThumbnailsUpdated = 0;

    // 1단계: RSS 수집 및 기본 정보 저장
    const articlesForThumbnailExtraction: Array<{ link: string; title: string }> = [];

    for (const source of RSS_SOURCES) {
      try {
        console.log(`📡 RSS 수집 시작: ${source.name}`);
        const feed = await parser.parseURL(source.url);
        console.log(`📄 ${feed.items.length}개 아티클 발견: ${source.name}`);

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

          const article = {
            title: item.title || '',
            description: item.contentSnippet || item.content || '',
            summary: item.content || '',
            content: processArticleContent(item.originContent || item.content || ''),
            link: item.link || '',
            pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            source_name: source.name,
            source_url: source.url,
            category: source.category,
            is_domestic: source.isDomestic,
            thumbnail: thumbnailUrl,
            view_count: 0,
          };

          // 썸네일이 없고 링크가 있는 경우 나중에 추출하기 위해 별도 배열에 저장
          if (!thumbnailUrl && item.link) {
            articlesForThumbnailExtraction.push({
              link: item.link,
              title: item.title || '',
            });
          }

          // 중복 체크 후 삽입
          const { error } = await supabase.from('articles').upsert(article, {
            onConflict: 'link',
            ignoreDuplicates: true,
          });

          if (!error) {
            articles.push(article);
          } else {
            console.error(`❌ DB 삽입 실패 (${item.title}):`, error);
          }
        }

        // RSS 소스 마지막 수집 시간 업데이트
        await supabase.from('rss_sources').upsert(
          {
            name: source.name,
            url: source.url,
            is_domestic: source.isDomestic,
            category: source.category,
            last_fetched: new Date().toISOString(),
          },
          { onConflict: 'url' },
        );

        console.log(`✅ RSS 수집 완료: ${source.name}`);
      } catch (error) {
        console.error(`❌ RSS 수집 실패 (${source.name}):`, error);
        continue;
      }
    }

    // 2단계: 썸네일이 없는 새 아티클들의 썸네일 배치 추출
    if (articlesForThumbnailExtraction.length > 0) {
      console.log(`🖼️  ${articlesForThumbnailExtraction.length}개 아티클의 썸네일 배치 추출 시작...`);

      const thumbnailMap = await extractThumbnailsBatch(articlesForThumbnailExtraction, 8);

      // 추출된 썸네일로 DB 업데이트
      for (const [link, thumbnail] of thumbnailMap.entries()) {
        const { error } = await supabase.from('articles').update({ thumbnail }).eq('link', link);

        if (!error) {
          thumbnailsExtracted++;
        }
      }
    }

    // 3단계: 기존 아티클 중 썸네일이 없는 것들 업데이트 (선택적)
    console.log(`🔄 기존 아티클 썸네일 업데이트 시작...`);
    existingThumbnailsUpdated = await updateExistingThumbnails(supabase, 15);

    const totalThumbnailsProcessed = thumbnailsExtracted + existingThumbnailsUpdated;

    return NextResponse.json({
      success: true,
      message: `${articles.length}개의 새로운 아티클을 수집했습니다. (신규 썸네일 ${thumbnailsExtracted}개, 기존 썸네일 ${existingThumbnailsUpdated}개 추출)`,
      articles: articles.length,
      totalProcessed,
      thumbnailsExtracted: totalThumbnailsProcessed,
      breakdown: {
        newArticles: articles.length,
        newThumbnails: thumbnailsExtracted,
        updatedThumbnails: existingThumbnailsUpdated,
      },
    });
  } catch (error) {
    console.error('❌ RSS 수집 중 오류:', error);
    return NextResponse.json({ success: false, error: 'RSS 수집 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
