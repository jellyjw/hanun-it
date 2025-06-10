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

// 썸네일 추출 함수
async function extractThumbnail(url: string): Promise<string | null> {
  try {
    const response = await fetch('/api/extract-thumbnail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

export async function GET() {
  try {
    const supabase = await createClient();
    const articles = [];
    let totalProcessed = 0;
    let thumbnailsExtracted = 0;

    for (const source of RSS_SOURCES) {
      try {
        console.log(`Fetching RSS from: ${source.name}`);
        const feed = await parser.parseURL(source.url);
        console.log(`Found ${feed.items.length} items from ${source.name}`);

        for (const item of feed.items) {
          totalProcessed++;

          // 1순위: RSS에서 제공하는 이미지
          let thumbnailUrl = item.enclosure?.url || item.image?.url || '';

          // 2순위: 원문 페이지에서 썸네일 추출
          if (!thumbnailUrl && item.link) {
            console.log(`썸네일 추출 시도: ${item.title}`);
            thumbnailUrl = (await extractThumbnail(item.link)) || '';
            if (thumbnailUrl) {
              thumbnailsExtracted++;
              console.log(`썸네일 추출 성공: ${item.title}`);
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
            view_count: 0, // 기본 조회수 0으로 설정
          };

          // 중복 체크 후 삽입
          const { error } = await supabase.from('articles').upsert(article, {
            onConflict: 'link',
            ignoreDuplicates: true,
          });

          if (!error) {
            articles.push(article);
          } else {
            console.error(`DB 삽입 오류 (${item.title}):`, error);
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

        console.log(`Completed processing ${source.name}`);
      } catch (error) {
        console.error(`Error fetching RSS from ${source.name}:`, error);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${articles.length}개의 아티클을 수집했습니다. (썸네일 ${thumbnailsExtracted}개 추출)`,
      articles: articles.length,
      totalProcessed,
      thumbnailsExtracted,
    });
  } catch (error) {
    console.error('RSS 수집 중 오류:', error);
    return NextResponse.json({ success: false, error: 'RSS 수집 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
