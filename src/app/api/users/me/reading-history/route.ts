import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST - 읽기 기록 저장
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

    const body = await request.json();
    const { article_id, article_type } = body;

    if (!article_id || !article_type) {
      return NextResponse.json({ success: false, error: 'article_id와 article_type이 필요합니다.' }, { status: 400 });
    }

    // 중복 체크: 같은 아티클을 이미 읽었으면 read_at만 업데이트
    const { data: existing } = await supabase
      .from('user_reading_history')
      .select('id')
      .eq('user_id', user.id)
      .eq('article_id', article_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_reading_history')
        .update({ read_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      const { error: insertError } = await supabase.from('user_reading_history').insert({
        user_id: user.id,
        article_id,
        article_type,
      });

      if (insertError) {
        console.error('읽기 기록 저장 오류:', insertError);
        return NextResponse.json({ success: false, error: '읽기 기록 저장에 실패했습니다.' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('읽기 기록 저장 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// GET - 읽기 기록 조회 (페이지네이션)
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

    const { data: history, error: historyError } = await supabase
      .from('user_reading_history')
      .select('id, article_id, article_type, read_at')
      .eq('user_id', user.id)
      .order('read_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (historyError) {
      console.error('읽기 기록 조회 오류:', historyError);
      return NextResponse.json({ success: false, error: '읽기 기록을 불러오는데 실패했습니다.' }, { status: 500 });
    }

    const { count } = await supabase
      .from('user_reading_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      history: history || [],
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
    console.error('읽기 기록 조회 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
