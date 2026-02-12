import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

    const email = user.email;
    if (!email) {
      return NextResponse.json(
        { success: false, error: '이메일 정보가 없습니다.' },
        { status: 400 }
      );
    }

    // 이미 구독 중인지 확인
    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('id, is_active')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { success: false, error: '이미 뉴스레터를 구독 중입니다.' },
          { status: 400 }
        );
      }

      // 비활성화된 구독이 있으면 다시 활성화
      const { error: updateError } = await supabase
        .from('newsletter_subscriptions')
        .update({
          is_active: true,
          email: email,
          updated_at: new Date().toISOString(),
          unsubscribed_at: null,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Newsletter reactivation error:', updateError);
        return NextResponse.json(
          { success: false, error: '구독 재활성화에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: '뉴스레터 구독이 재활성화되었습니다!',
      });
    }

    // 새 구독 생성
    const { error: insertError } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        user_id: user.id,
        email: email,
        is_active: true,
      });

    if (insertError) {
      console.error('Newsletter subscription error:', insertError);
      return NextResponse.json(
        { success: false, error: '구독 신청에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '뉴스레터 구독이 완료되었습니다!',
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 구독 상태 확인
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request);

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

    const { data: subscription } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        isSubscribed: subscription?.is_active ?? false,
        subscription: subscription || null,
      },
    });
  } catch (error) {
    console.error('Newsletter status error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
