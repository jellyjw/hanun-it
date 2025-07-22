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

    for (const source of RSS_SOURCES) {
      try {
        const feed = await parser.parseURL(source.url);
        const articlesToInsert: any[] = [];

        const promises = feed.items.map(async (item: any) => {
          if (!item.link) return;

          const thumbnailUrl = await extractThumbnailFromUrl(item.link);
          const articleContent = item['content:encoded'] || item.content || '';

          articlesToInsert.push({
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
          });
        });

        await Promise.all(promises);

        if (articlesToInsert.length > 0) {
          const { error } = await supabase.from('articles').upsert(articlesToInsert, {
            onConflict: 'link',
          });
          if (error) {
            console.error(`DB 저장 실패 (${source.name}):`, error);
          } else {
            totalArticlesProcessed += articlesToInsert.length;
          }
        }
      } catch (error) {
        console.error(`RSS 피드 처리 실패 (${source.name}):`, error);
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
