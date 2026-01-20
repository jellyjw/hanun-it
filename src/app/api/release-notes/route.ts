import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { CreateReleaseNoteRequest } from '@/types/releaseNotes';

// 관리자 권한 확인 헬퍼 함수
async function checkAdminAuth(request: NextRequest) {
  const supabase = await createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAdmin: false, user: null };
  }

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((email) => email.trim());
  const isAdmin = user && (user.user_metadata?.role === 'admin' || adminEmails.includes(user.email || ''));

  return { isAdmin, user };
}

// 릴리즈 노트 목록 조회 (GET /api/release-notes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    const supabase = await createClient(request);
    const offset = (page - 1) * limit;

    // 관리자 확인
    const { isAdmin } = await checkAdminAuth(request);

    // 쿼리 빌더 시작
    let query = supabase.from('release_notes').select('*', { count: 'exact' });

    // 비공개 포함 여부 (관리자만 가능)
    if (!includeUnpublished || !isAdmin) {
      query = query.eq('is_published', true);
    }

    // 정렬 및 페이지네이션
    const { data: releaseNotes, error, count } = await query
      .order('released_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('릴리즈 노트 조회 오류:', error);
      return NextResponse.json({ success: false, error: '릴리즈 노트를 불러오는데 실패했습니다.' }, { status: 500 });
    }

    const total = count || 0;

    const response = NextResponse.json({
      success: true,
      data: releaseNotes || [],
      total,
      page,
      limit,
    });

    // 캐시 헤더 추가 (5분)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return response;
  } catch (error) {
    console.error('릴리즈 노트 API 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 릴리즈 노트 작성 (POST /api/release-notes)
export async function POST(request: NextRequest) {
  try {
    const body: CreateReleaseNoteRequest = await request.json();
    const { version, title, description, content, released_at, is_published = true } = body;

    // 필수 필드 검증
    if (!version || !title || !content || !released_at) {
      return NextResponse.json(
        { success: false, error: 'version, title, content, released_at는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    // 관리자 권한 확인
    const { isAdmin, user } = await checkAdminAuth(request);

    if (!isAdmin || !user) {
      return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const supabase = await createClient(request);

    // 릴리즈 노트 작성
    const { data: releaseNote, error: insertError } = await supabase
      .from('release_notes')
      .insert({
        version,
        title,
        description,
        content,
        released_at,
        is_published,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('릴리즈 노트 작성 오류:', insertError);
      return NextResponse.json({ success: false, error: '릴리즈 노트 작성에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: releaseNote,
    });
  } catch (error) {
    console.error('릴리즈 노트 작성 API 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
