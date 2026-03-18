import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkIsAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get newsletter subscribers with comment counts
    const { data: subscribers, count, error } = await supabase
      .from('newsletter_subscriptions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Users query error:', error);
      return NextResponse.json({ success: false, error: '사용자 목록 조회 실패' }, { status: 500 });
    }

    // Get comment counts per user
    const userIds = (subscribers ?? []).map((s) => s.user_id).filter(Boolean);
    const commentCounts: Record<string, number> = {};

    if (userIds.length > 0) {
      const { data: comments } = await supabase
        .from('comments')
        .select('user_id')
        .in('user_id', userIds);

      (comments ?? []).forEach((c) => {
        commentCounts[c.user_id] = (commentCounts[c.user_id] || 0) + 1;
      });
    }

    const users = (subscribers ?? []).map((s) => ({
      ...s,
      comment_count: commentCounts[s.user_id] || 0,
    }));

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ success: false, error: '사용자 조회 실패' }, { status: 500 });
  }
}
