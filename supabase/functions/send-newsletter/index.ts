import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = 'https://hanun-it.com';

// Emerald 테마
const COLORS = {
  primary: '#10B981',
  primaryLight: '#D1FAE5',
  text: '#1F2937',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  background: '#FAFAFA',
};

interface Article {
  id: string;
  title: string;
  source_name: string;
  view_count: number;
}

function getWeekOfMonth(date: Date): number {
  const day = date.getDate();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();

  let firstMonday: number;
  if (firstDayOfWeek === 1) {
    firstMonday = 1;
  } else if (firstDayOfWeek === 0) {
    firstMonday = 2;
  } else {
    firstMonday = 1 + (8 - firstDayOfWeek);
  }

  if (day < firstMonday) return 1;
  return Math.floor((day - firstMonday) / 7) + 1;
}

function generateEmailSubject(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const weekNum = getWeekOfMonth(now);
  const weekNames = ['', '첫째', '둘째', '셋째', '넷째', '다섯째'];
  const weekName = weekNames[Math.min(weekNum, 5)];
  return `[한눈IT] ${month}월 ${weekName} 주 인기 아티클 모음!`;
}

function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

function renderArticleCard(article: Article, showViews: boolean, isLast: boolean): string {
  const url = `${SITE_URL}/articles/${article.id}`;
  const borderStyle = isLast ? '' : 'border-bottom: 1px solid #F3F4F6;';

  return `
    <tr>
      <td style="padding: 10px 0; ${borderStyle}">
        <a href="${url}" style="text-decoration: none; display: block;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 20px; vertical-align: top; padding-top: 4px;">
                <span style="display: inline-block; width: 8px; height: 8px; background: ${COLORS.primary}; border-radius: 50%;"></span>
              </td>
              <td style="vertical-align: top;">
                <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: ${COLORS.text}; line-height: 1.5;">${truncate(article.title, 55)}</p>
                <p style="margin: 0; font-size: 12px; color: ${COLORS.textMuted};">${article.source_name}${showViews && article.view_count ? ` · 조회 ${article.view_count.toLocaleString()}` : ''}</p>
              </td>
            </tr>
          </table>
        </a>
      </td>
    </tr>
  `;
}

function renderSection(title: string, articles: Article[], showViews: boolean): string {
  if (!articles.length) return '';
  return `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #FFFFFF; border-radius: 12px; overflow: hidden;">
      <tr>
        <td style="padding: 16px 16px 8px;">
          <p style="margin: 0; font-size: 13px; font-weight: 700; color: ${COLORS.primary};">${title}</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 16px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            ${articles.map((a, i) => renderArticleCard(a, showViews, i === articles.length - 1)).join('')}
          </table>
        </td>
      </tr>
    </table>
  `;
}

function generateHtml(newArticles: Article[], popularArticles: Article[], unsubscribeUrl: string): string {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table style="width: 100%; background-color: ${COLORS.background}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table style="width: 100%; max-width: 420px;">
          <tr>
            <td style="padding-bottom: 24px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 22px; font-weight: 700; color: ${COLORS.primary};">한눈IT</p>
              <p style="margin: 0; font-size: 12px; color: ${COLORS.textMuted};">${today}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: ${COLORS.text};">이번 주 놓치면 아쉬운 아티클 😎</p>
              <p style="margin: 0; font-size: 12px; color: #6B7280;">국내 IT 기업들의 기술 블로그를 모았어요</p>
            </td>
          </tr>
          <tr><td>${renderSection('신규 아티클', newArticles, false)}</td></tr>
          <tr><td>${renderSection('인기 아티클 TOP 3', popularArticles, true)}</td></tr>
          <tr>
            <td style="padding: 8px 0 24px; text-align: center;">
              <a href="${SITE_URL}" style="display: inline-block; background: ${COLORS.primary}; color: white; padding: 11px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">더 많은 아티클 보기</a>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 20px; border-top: 1px solid ${COLORS.border}; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; color: ${COLORS.textMuted};">본 메일은 한눈IT 뉴스레터 구독자에게 발송됩니다</p>
              <p style="margin: 0; font-size: 11px;"><a href="${unsubscribeUrl}" style="color: ${COLORS.textMuted}; text-decoration: underline;">구독 취소</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

serve(async (req) => {
  // 인증 확인 (Cron에서 호출 시 Authorization 헤더 체크)
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 날짜 설정
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 국내 신규 아티클 3개
    const { data: newArticles } = await supabase
      .from('articles')
      .select('id, title, source_name, view_count')
      .eq('is_domestic', true)
      .gte('pub_date', sevenDaysAgo.toISOString())
      .order('pub_date', { ascending: false })
      .limit(3);

    const newArticleIds = (newArticles || []).map((a) => a.id);

    // 국내 인기 아티클 3개 (중복 제외)
    const { data: allPopular } = await supabase
      .from('articles')
      .select('id, title, source_name, view_count')
      .eq('is_domestic', true)
      .gte('pub_date', thirtyDaysAgo.toISOString())
      .order('view_count', { ascending: false })
      .limit(10);

    const popularArticles = (allPopular || [])
      .filter((a) => !newArticleIds.includes(a.id))
      .slice(0, 3);

    // 활성 구독자 조회
    const { data: subscribers } = await supabase
      .from('newsletter_subscriptions')
      .select('user_id, email')
      .eq('is_active', true);

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No subscribers', sentCount: 0 }));
    }

    // 이메일 발송
    let successCount = 0;
    let failedCount = 0;

    for (const subscriber of subscribers) {
      const token = btoa(subscriber.user_id);
      const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?userId=${subscriber.user_id}&token=${token}`;
      const html = generateHtml(newArticles || [], popularArticles, unsubscribeUrl);

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: '한눈IT <newsletter@hanun-it.com>',
            to: subscriber.email,
            subject: generateEmailSubject(),
            html,
          }),
        });

        if (res.ok) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Newsletter sent: ${successCount} success, ${failedCount} failed`,
        sentCount: successCount,
        failedCount,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
