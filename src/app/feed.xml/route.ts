import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.includes('hanun-it.com')
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'https://hanun-it.com';

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, description, pub_date, source_name, category')
    .order('pub_date', { ascending: false })
    .limit(50);

  const { data: newsArticles } = await supabase
    .from('it_news')
    .select('id, title, description, pub_date, source_name')
    .order('pub_date', { ascending: false })
    .limit(50);

  const allItems = [
    ...(articles?.map((a) => ({ ...a, type: 'articles' })) || []),
    ...(newsArticles?.map((a) => ({ ...a, type: 'articles', category: 'it-news' })) || []),
  ]
    .sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime())
    .slice(0, 50);

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const itemsXml = allItems
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${baseUrl}/articles/${item.id}</link>
      <description>${escapeXml(item.description || item.title)}</description>
      <pubDate>${new Date(item.pub_date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${baseUrl}/articles/${item.id}</guid>
      <source url="${baseUrl}">${escapeXml(item.source_name)}</source>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>한눈IT - 국내, 해외의 IT 최신 아티클을 한눈에</title>
    <link>${baseUrl}</link>
    <description>최신 IT 뉴스와 기술 트렌드를 한눈에 확인하세요. 개발자와 IT 전문가를 위한 큐레이션된 콘텐츠를 제공합니다.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=1200',
    },
  });
}
