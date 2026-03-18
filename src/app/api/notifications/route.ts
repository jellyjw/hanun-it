import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// 알림 목록 조회 (GET /api/notifications?page=1&limit=20)
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 알림 목록 + 읽지 않은 수 병렬 조회
    const [notificationsResult, unreadCountResult, totalCountResult] = await Promise.all([
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false),
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);

    if (notificationsResult.error) {
      // notifications 테이블이 아직 없는 경우 빈 결과 반환
      if (notificationsResult.error.code === '42P01' || notificationsResult.error.message?.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          notifications: [],
          unreadCount: 0,
          pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        });
      }
      console.error('알림 조회 오류:', notificationsResult.error);
      return NextResponse.json({ success: false, error: '알림을 불러오는데 실패했습니다.' }, { status: 500 });
    }

    const total = totalCountResult.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      notifications: notificationsResult.data || [],
      unreadCount: unreadCountResult.count || 0,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('알림 API 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 알림 읽음 처리 (PATCH /api/notifications)
// body: { id: string } 또는 { id: "all" }
export async function PATCH(request: NextRequest) {
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

    if (id === 'all') {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('전체 읽음 처리 오류:', error);
        return NextResponse.json({ success: false, error: '전체 읽음 처리에 실패했습니다.' }, { status: 500 });
      }
    } else {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('읽음 처리 오류:', error);
        return NextResponse.json({ success: false, error: '읽음 처리에 실패했습니다.' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('알림 읽음 처리 API 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 알림 삭제 (DELETE /api/notifications)
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

    const { error } = await supabase.from('notifications').delete().eq('id', id).eq('user_id', user.id);

    if (error) {
      console.error('알림 삭제 오류:', error);
      return NextResponse.json({ success: false, error: '알림 삭제에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('알림 삭제 API 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
