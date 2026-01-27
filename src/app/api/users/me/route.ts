import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { UserProfile, UpdateProfileResponse } from '@/types/user';

// GET - 현재 로그인한 사용자 프로필 조회
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

    const provider = user.app_metadata?.provider || 'email';
    const socialProviders = ['google', 'github', 'facebook', 'twitter', 'discord', 'kakao', 'naver'];
    const isSocialLogin = socialProviders.includes(provider);

    const profile: UserProfile = {
      id: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
      provider,
      isSocialLogin,
      createdAt: user.created_at,
      updatedAt: user.user_metadata?.updated_at || null,
    };

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// PATCH - 프로필 수정
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

    const { avatarUrl } = await request.json();

    // user_metadata 업데이트
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

    const { error: updateError } = await supabase.auth.updateUser({
      data: updateData,
    });

    if (updateError) {
      console.error('프로필 업데이트 오류:', updateError);
      return NextResponse.json({ success: false, error: '프로필 업데이트에 실패했습니다.' }, { status: 500 });
    }

    // 업데이트된 사용자 정보 다시 조회
    const {
      data: { user: updatedUser },
    } = await supabase.auth.getUser();

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: '사용자 정보를 불러올 수 없습니다.' }, { status: 500 });
    }

    const provider = updatedUser.app_metadata?.provider || 'email';
    const socialProviders = ['google', 'github', 'facebook', 'twitter', 'discord', 'kakao', 'naver'];
    const isSocialLogin = socialProviders.includes(provider);

    const profile: UserProfile = {
      id: updatedUser.id,
      email: updatedUser.email || '',
      fullName: updatedUser.user_metadata?.full_name || null,
      avatarUrl: updatedUser.user_metadata?.avatar_url || null,
      provider,
      isSocialLogin,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.user_metadata?.updated_at || null,
    };

    const response: UpdateProfileResponse = {
      success: true,
      profile,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('프로필 수정 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
