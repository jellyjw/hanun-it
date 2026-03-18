import { MetadataRoute } from 'next';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.includes('hanun-it.com')
      ? process.env.NEXT_PUBLIC_SITE_URL
      : 'https://hanun-it.com';

  const staticPages = ['', '/articles', '/videos', '/profile'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const [articlesResult, newsResult] = await Promise.all([
      supabase
        .from('articles')
        .select('id, updated_at, pub_date')
        .order('pub_date', { ascending: false })
        .limit(5000),
      supabase.from('it_news').select('id, updated_at, pub_date').order('pub_date', { ascending: false }).limit(5000),
    ]);

    const articlePages =
      articlesResult.data?.map((article) => ({
        url: `${baseUrl}/articles/${article.id}`,
        lastModified: article.updated_at || article.pub_date,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })) || [];

    const newsPages =
      newsResult.data?.map((news) => ({
        url: `${baseUrl}/articles/${news.id}`,
        lastModified: news.updated_at || news.pub_date,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })) || [];

    return [...staticPages, ...articlePages, ...newsPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
