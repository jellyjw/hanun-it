import { MetadataRoute } from 'next';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSiteUrl, getAbsoluteUrl } from '@/utils/url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 사이트맵은 항상 프로덕션 도메인 사용 (SEO 목적)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.includes('hanun-it.com') 
    ? process.env.NEXT_PUBLIC_SITE_URL 
    : 'https://hanun-it.com';

  // 정적 페이지 목록
  const staticPages = ['', '/articles', '/videos', '/profile'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // 인증이 필요 없는 공개 데이터만 가져오므로 직접 클라이언트 생성
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // 최근 아티클들 가져오기 (최대 1000개)
    const { data: articles } = await supabase
      .from('articles')
      .select('id, updated_at, pub_date')
      .order('pub_date', { ascending: false })
      .limit(1000);

    const articlePages =
      articles?.map((article) => ({
        url: `${baseUrl}/articles/${article.id}`,
        lastModified: article.updated_at || article.pub_date,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })) || [];

    return [...staticPages, ...articlePages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
