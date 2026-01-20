import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { UpdateReleaseNoteRequest } from '@/types/releaseNotes';

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

// 릴리즈 노트 상세 조회 (GET /api/release-notes/[id])
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id가 필요합니다.' }, { status: 400 });
    }

    const supabase = await createClient(request);
    const { isAdmin } = await checkAdminAuth(request);

    // 릴리즈 노트 조회
    let query = supabase.from('release_notes').select('*').eq('id', id);

    // 비관리자는 공개된 것만 조회 가능
    if (!isAdmin) {
      query = query.eq('is_published', true);
    }

    const { data: releaseNote, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: '릴리즈 노트를 찾을 수 없습니다.' }, { status: 404 });
      }
      console.error('릴리즈 노트 조회 오류:', error);
      return NextResponse.json({ success: false, error: '릴리즈 노트를 불러오는데 실패했습니다.' }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      data: releaseNote,
    });

    // 캐시 헤더 추가 (5분)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return response;
  } catch (error) {
    console.error('릴리즈 노트 상세 조회 API 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 릴리즈 노트 수정 (PUT /api/release-notes/[id])
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id가 필요합니다.' }, { status: 400 });
    }

    const body: UpdateReleaseNoteRequest = await request.json();

    // 관리자 권한 확인
    const { isAdmin } = await checkAdminAuth(request);

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const supabase = await createClient(request);

    // 수정할 필드만 추출
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.version !== undefined) updateData.version = body.version;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.released_at !== undefined) updateData.released_at = body.released_at;
    if (body.is_published !== undefined) updateData.is_published = body.is_published;

    // 릴리즈 노트 수정
    const { data: releaseNote, error: updateError } = await supabase
      .from('release_notes')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('릴리즈 노트 수정 오류:', updateError);
      return NextResponse.json({ success: false, error: '릴리즈 노트 수정에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: releaseNote,
    });
  } catch (error) {
    console.error('릴리즈 노트 수정 API 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 릴리즈 노트 삭제 (DELETE /api/release-notes/[id])
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id가 필요합니다.' }, { status: 400 });
    }

    // 관리자 권한 확인
    const { isAdmin } = await checkAdminAuth(request);

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const supabase = await createClient(request);

    // 릴리즈 노트 삭제
    const { error: deleteError } = await supabase.from('release_notes').delete().eq('id', id);

    if (deleteError) {
      console.error('릴리즈 노트 삭제 오류:', deleteError);
      return NextResponse.json({ success: false, error: '릴리즈 노트 삭제에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '릴리즈 노트가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('릴리즈 노트 삭제 API 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
