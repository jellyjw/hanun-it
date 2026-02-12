import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const COLORS = {
  primary: '#10B981',
  primaryLight: '#D1FAE5',
  primaryPastel: '#ECFDF5',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#D1FAE5',
  cardBg: '#FFFFFF',
  background: '#FAFAFA',
};

const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table style="width: 100%; background-color: ${COLORS.background}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table style="width: 100%; max-width: 480px;">
          <tr>
            <td style="padding-bottom: 32px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 24px; font-weight: 700; color: ${COLORS.primary};">한눈IT</p>
              <p style="margin: 0; font-size: 13px; color: ${COLORS.textMuted};">${today}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <table style="width: 100%; background: linear-gradient(135deg, ${COLORS.primaryPastel} 0%, ${COLORS.primaryLight} 100%); border-radius: 16px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: ${COLORS.text};">이번 주 놓치면 아쉬운 아티클 😎</p>
                    <p style="margin: 0; font-size: 13px; color: ${COLORS.textSecondary};">가장 많이 읽은 IT 아티클을 모았어요</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: ${COLORS.primary}; text-transform: uppercase; letter-spacing: 0.5px;">인기 아티클 TOP 3</p>

              <table style="width: 100%; background: ${COLORS.cardBg}; border-radius: 12px; border: 1px solid ${COLORS.border}; margin-bottom: 8px;">
                <tr>
                  <td style="width: 50px; padding: 16px; text-align: center;">
                    <span style="font-size: 20px; font-weight: 700; color: ${COLORS.primary};">1</span>
                  </td>
                  <td style="padding: 12px 16px 12px 0;">
                    <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: ${COLORS.text};">2024년 개발자가 알아야 할 AI 트렌드</p>
                    <p style="margin: 0; font-size: 11px; color: ${COLORS.textMuted};">GeekNews · 조회 2,341</p>
                  </td>
                </tr>
              </table>

              <table style="width: 100%; background: ${COLORS.cardBg}; border-radius: 12px; border: 1px solid ${COLORS.border}; margin-bottom: 8px;">
                <tr>
                  <td style="width: 50px; padding: 16px; text-align: center;">
                    <span style="font-size: 20px; font-weight: 700; color: ${COLORS.primary};">2</span>
                  </td>
                  <td style="padding: 12px 16px 12px 0;">
                    <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: ${COLORS.text};">React 19 새로운 기능 총정리</p>
                    <p style="margin: 0; font-size: 11px; color: ${COLORS.textMuted};">카카오 기술블로그 · 조회 1,892</p>
                  </td>
                </tr>
              </table>

              <table style="width: 100%; background: ${COLORS.cardBg}; border-radius: 12px; border: 1px solid ${COLORS.border}; margin-bottom: 24px;">
                <tr>
                  <td style="width: 50px; padding: 16px; text-align: center;">
                    <span style="font-size: 20px; font-weight: 700; color: ${COLORS.primary};">3</span>
                  </td>
                  <td style="padding: 12px 16px 12px 0;">
                    <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: ${COLORS.text};">TypeScript 5.4 업데이트 내용</p>
                    <p style="margin: 0; font-size: 11px; color: ${COLORS.textMuted};">토스 기술블로그 · 조회 1,567</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0 32px; text-align: center;">
              <a href="https://hanun-it.com" style="display: inline-block; background: ${COLORS.primary}; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">더 많은 아티클 보기</a>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; border-top: 1px solid ${COLORS.border}; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: ${COLORS.textMuted};">본 메일은 한눈IT 뉴스레터 테스트입니다</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

async function sendTest() {
  console.log('📧 테스트 메일 발송 중...');

  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'jiujang356@gmail.com',
      subject: '[한눈IT] 이번주 인기 아티클 모음! (테스트)',
      html: html,
    });

    console.log('✅ 발송 성공!', result);
  } catch (error) {
    console.error('❌ 발송 실패:', error.message);
  }
}

sendTest();
