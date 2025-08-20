import { getSitemapUrl } from '@/utils/url';

export async function GET() {
  const sitemapUrl = getSitemapUrl();

  const robotsTxt = `# Allow all crawlers
User-agent: *
Allow: /

# Sitemap location
Sitemap: ${sitemapUrl}`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}