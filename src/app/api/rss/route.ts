import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@/utils/supabase/server';
import { RSS_SOURCES } from '@/utils/constants';
import { processArticleContent } from '@/utils/markdown';
import { NextRequest } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인 (GitHub Actions용 인증 추가)
    const authHeader = request.headers.get('authorization');
    const isGitHubActions = request.headers.get('user-agent')?.includes('GitHub-Actions-Bot');
    const isAdmin = await checkAdminPermission();

    if (!isAdmin && !isGitHubActions) {
      return NextResponse.json({ success: false, error: '권한이 필요합니다.' }, { status: 403 });
    }

    const supabase = await createClient();
    const articles = [];
    let totalProcessed = 0;

    // 썸네일 추출 완전 제거 -> 별도 API에서 처리
    for (const source of RSS_SOURCES.slice(0, 10)) {
      // 처음 10개만 처리로 제한
      try {
        console.log(`📡 RSS 수집: ${source.name}`);

        // 타임아웃 설정으로 빠른 실패
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('RSS 파싱 타임아웃')), 3000),
        );

        const feed = (await Promise.race([parser.parseURL(source.url), timeoutPromise])) as CustomFeed;

        for (const item of feed.items.slice(0, 5)) {
          // 각 소스당 최대 5개만
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
            thumbnail: '', // 빈 값으로 저장
            view_count: 0,
          };

          const { error } = await supabase.from('articles').upsert(article, {
            onConflict: 'link',
            ignoreDuplicates: true,
          });

          if (!error) {
            articles.push(article);
          }
          totalProcessed++;
        }
      } catch (error) {
        console.log(`⚠️ ${source.name} 스킵: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        continue; // 에러 시 다음 소스로
      }
    }

    return NextResponse.json({
      success: true,
      message: `${articles.length}개 아티클 수집 완료`,
      articles: articles.length,
      totalProcessed,
      note: '썸네일은 별도 처리됩니다',
    });
  } catch (error) {
    console.error('RSS 수집 오류:', error);
    return NextResponse.json({ success: false, error: 'RSS 수집 실패' }, { status: 500 });
  }
}
