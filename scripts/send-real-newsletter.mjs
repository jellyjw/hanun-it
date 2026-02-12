import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SITE_URL = 'https://hanun-it.com';

// Emerald 테마
const COLORS = {
  primary: '#10B981',
  primaryLight: '#D1FAE5',
  primaryPastel: '#ECFDF5',
  background: '#FAFAFA',
  cardBg: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
};

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

function renderArticleCard(article, showViews = false, isLast = false) {
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

function renderSection(title, articles, showViews = false) {
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

function generateHtml(newArticles, popularArticles) {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[한눈IT] 이번주 인기 아티클 모음!</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
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
              <p style="margin: 0; font-size: 12px; color: ${COLORS.textSecondary};">국내 IT 기업들의 기술 블로그를 모았어요</p>
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
              <p style="margin: 0; font-size: 11px;"><a href="${SITE_URL}/mypage" style="color: ${COLORS.textMuted}; text-decoration: underline;">구독 취소</a></p>
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

async function main() {
  console.log('📧 실제 뉴스레터 발송 준비 중...\n');

  // 날짜 설정
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 국내 새로운 아티클 3개 (최근 7일)
  const { data: newArticles } = await supabase
    .from('articles')
    .select('id, title, description, thumbnail, source_name, pub_date, view_count')
    .eq('is_domestic', true)
    .gte('pub_date', sevenDaysAgo.toISOString())
    .order('pub_date', { ascending: false })
    .limit(3);

  // 새 아티클 ID 목록 (중복 제거용)
  const newArticleIds = (newArticles || []).map(a => a.id);

  // 국내 인기 아티클 3개 (최근 30일, 새 아티클 제외)
  const { data: allPopular } = await supabase
    .from('articles')
    .select('id, title, description, thumbnail, source_name, pub_date, view_count')
    .eq('is_domestic', true)
    .gte('pub_date', thirtyDaysAgo.toISOString())
    .order('view_count', { ascending: false })
    .limit(10);

  // 새 아티클과 중복되지 않는 인기 아티클만 선택
  const popularArticles = (allPopular || [])
    .filter(a => !newArticleIds.includes(a.id))
    .slice(0, 3);

  console.log('📰 새로운 국내 아티클:', newArticles?.length || 0, '개');
  newArticles?.forEach((a, i) => console.log(`   ${i + 1}. ${a.title} (${a.source_name})`));

  console.log('\n🔥 인기 국내 아티클:', popularArticles?.length || 0, '개');
  popularArticles?.forEach((a, i) => console.log(`   ${i + 1}. ${a.title} (조회 ${a.view_count || 0})`));

  if (!newArticles?.length && !popularArticles?.length) {
    console.log('\n⚠️ 발송할 아티클이 없습니다.');
    return;
  }

  const html = generateHtml(newArticles || [], popularArticles || []);

  console.log('\n📤 메일 발송 중...');

  try {
    const result = await resend.emails.send({
      from: '한눈IT <newsletter@hanun-it.com>',
      to: 'jiujang356@gmail.com',
      subject: '[한눈IT] 이번주 인기 아티클 모음!',
      html: html,
    });

    if (result.error) {
      console.error('❌ 발송 실패:', result.error.message);
    } else {
      console.log('✅ 발송 성공! ID:', result.data.id);
    }
  } catch (error) {
    console.error('❌ 발송 오류:', error.message);
  }
}

main();
