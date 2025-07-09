import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:7007';
const CRON_SECRET = Deno.env.get('CRON_SECRET');
console.log('CRON_SECRET from Deno.env:', CRON_SECRET);
console.log('SITE_URL from Deno.env:', SITE_URL);

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log('🚀 Cron job started: Fetching IT news and articles...');

    // IT 뉴스 업데이트
    const itNewsResponse = await fetch(`${SITE_URL}/api/it-news/rss`, {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
        'User-Agent': 'Supabase-Cron-Function',
      },
    });
    const itNewsResult = await itNewsResponse.json();
    console.log('✅ IT News update response:', itNewsResult);

    // 아티클 업데이트
    const articlesResponse = await fetch(`${SITE_URL}/api/rss`, {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
        'User-Agent': 'Supabase-Cron-Function',
      },
    });
    const articlesResult = await articlesResponse.json();
    console.log('✅ Articles update response:', articlesResult);

    console.log('🎉 Cron job finished successfully.');

    return new Response(
      JSON.stringify({
        message: 'Cron job executed successfully',
        itNews: itNewsResult,
        articles: articlesResult,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('❌ Cron job failed:', error);
    return new Response(JSON.stringify({ error: 'Cron job execution failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
