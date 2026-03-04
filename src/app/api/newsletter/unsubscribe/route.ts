import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifyUnsubscribeToken } from '@/lib/newsletter-token';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request);

    // 로그인 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 구독 정보 확인
    const { data: subscription } = await supabase
      .from('newsletter_subscriptions')
      .select('id, is_active')
      .eq('user_id', user.id)
      .single();

    if (!subscription || !subscription.is_active) {
      return NextResponse.json(
        { success: false, error: '구독 중인 뉴스레터가 없습니다.' },
        { status: 400 }
      );
    }

    // 구독 취소 (soft delete)
    const { error: updateError } = await supabase
      .from('newsletter_subscriptions')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Newsletter unsubscribe error:', updateError);
      return NextResponse.json(
        { success: false, error: '구독 취소에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '뉴스레터 구독이 취소되었습니다.',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 토큰 기반 구독 취소 (이메일 링크용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 요청입니다.' },
        { status: 400 }
      );
    }

    // HMAC 서명 검증으로 userId 추출
    const userId = verifyUnsubscribeToken(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 400 }
      );
    }

    const supabase = await createClient(request);

    // 구독 취소
    const { error: updateError } = await supabase
      .from('newsletter_subscriptions')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Newsletter unsubscribe by token error:', updateError);
      return NextResponse.json(
        { success: false, error: '구독 취소에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 구독 취소 완료 페이지로 리다이렉트
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hanun-it.com';
    return NextResponse.redirect(`${siteUrl}/newsletter/unsubscribed`);
  } catch (error) {
    console.error('Newsletter unsubscribe by token error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
