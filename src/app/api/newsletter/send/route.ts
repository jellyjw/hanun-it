import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/utils/supabase/server';
import { checkIsAdmin } from '@/lib/admin';
import { generateNewsletterHtml } from '@/lib/newsletter-template';
import { NewsletterArticle } from '@/types/newsletter';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hanun-it.com';

function getWeekOfMonth(date: Date): number {
  const day = date.getDate();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // 첫 번째 월요일 찾기
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

function generateUnsubscribeUrl(userId: string): string {
  const token = Buffer.from(userId).toString('base64');
  return `${SITE_URL}/api/newsletter/unsubscribe?userId=${userId}&token=${token}`;
}

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabase = await createClient(request);

    // 관리자 확인
    const isAdmin = await checkIsAdmin(supabase);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: '관리자만 뉴스레터를 발송할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 날짜 설정
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 국내 새로운 아티클 3개 (최근 7일)
    const { data: newArticles } = await supabase
      .from('articles')
      .select('id, title, description, thumbnail, source_name, pub_date, view_count, link')
      .eq('is_domestic', true)
      .gte('pub_date', sevenDaysAgo.toISOString())
      .order('pub_date', { ascending: false })
      .limit(3);

    // 새 아티클 ID 목록 (중복 제거용)
    const newArticleIds = (newArticles || []).map((a) => a.id);

    // 국내 인기 아티클 (최근 30일, 새 아티클 제외)
    const { data: allPopular } = await supabase
      .from('articles')
      .select('id, title, description, thumbnail, source_name, pub_date, view_count, link')
      .eq('is_domestic', true)
      .gte('pub_date', thirtyDaysAgo.toISOString())
      .order('view_count', { ascending: false })
      .limit(10);

    // 새 아티클과 중복되지 않는 인기 아티클만 선택
    const popularArticles = (allPopular || [])
      .filter((a) => !newArticleIds.includes(a.id))
      .slice(0, 3);

    const newArticlesList: NewsletterArticle[] = (newArticles || []).map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description || '',
      thumbnail: a.thumbnail,
      source_name: a.source_name,
      pub_date: a.pub_date,
      view_count: a.view_count || 0,
      link: a.link,
    }));

    const popularArticlesList: NewsletterArticle[] = popularArticles.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description || '',
      thumbnail: a.thumbnail,
      source_name: a.source_name,
      pub_date: a.pub_date,
      view_count: a.view_count || 0,
      link: a.link,
    }));

    // 활성 구독자 목록 조회
    const { data: subscribers } = await supabase
      .from('newsletter_subscriptions')
      .select('user_id, email')
      .eq('is_active', true);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: '발송할 구독자가 없습니다.',
        sentCount: 0,
      });
    }

    // 이메일 발송
    const results = await Promise.allSettled(
      subscribers.map(async (subscriber) => {
        const unsubscribeUrl = generateUnsubscribeUrl(subscriber.user_id);
        const html = generateNewsletterHtml(
          newArticlesList,
          popularArticlesList,
          unsubscribeUrl
        );

        return resend.emails.send({
          from: '한눈IT <newsletter@hanun-it.com>',
          to: subscriber.email,
          subject: generateEmailSubject(),
          html,
        });
      })
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failedCount = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      message: `뉴스레터 발송 완료: 성공 ${successCount}건, 실패 ${failedCount}건`,
      sentCount: successCount,
      failedCount,
      totalSubscribers: subscribers.length,
    });
  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { success: false, error: '뉴스레터 발송에 실패했습니다.' },
      { status: 500 }
    );
  }
}
