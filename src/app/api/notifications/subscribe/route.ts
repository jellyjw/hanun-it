import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// 알림 구독 목록 조회 (GET /api/notifications/subscribe)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { data: subscriptions, error } = await supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('구독 조회 오류:', error);
      return NextResponse.json({ success: false, error: '구독 목록을 불러오는데 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, subscriptions: subscriptions || [] });
  } catch (error) {
    console.error('구독 API 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 알림 구독 추가 (POST /api/notifications/subscribe)
// body: { source_name?: string, category?: string }
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { source_name, category } = await request.json();

    if (!source_name && !category) {
      return NextResponse.json(
        { success: false, error: 'source_name 또는 category가 필요합니다.' },
        { status: 400 },
      );
    }

    const { data: subscription, error } = await supabase
      .from('notification_subscriptions')
      .insert({
        user_id: user.id,
        source_name: source_name || null,
        category: category || null,
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: '이미 구독 중입니다.' }, { status: 409 });
      }
      console.error('구독 추가 오류:', error);
      return NextResponse.json({ success: false, error: '구독 추가에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error('구독 추가 API 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 알림 구독 해제 (DELETE /api/notifications/subscribe)
// body: { id: string }
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient(request);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'id가 필요합니다.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('notification_subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('구독 해제 오류:', error);
      return NextResponse.json({ success: false, error: '구독 해제에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('구독 해제 API 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
