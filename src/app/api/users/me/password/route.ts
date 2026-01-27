import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ChangePasswordResponse } from '@/types/user';

// PATCH - 비밀번호 변경
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

    // 소셜 로그인 사용자는 비밀번호 변경 불가
    const provider = user.app_metadata?.provider || 'email';
    const socialProviders = ['google', 'github', 'facebook', 'twitter', 'discord', 'kakao', 'naver'];
    if (socialProviders.includes(provider)) {
      return NextResponse.json(
        { success: false, error: '소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.' },
        { status: 400 }
      );
    }

    const { newPassword, confirmPassword } = await request.json();

    // 유효성 검사
    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: '새 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: '새 비밀번호가 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: '비밀번호는 최소 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 강도 검사 (대문자, 소문자, 숫자 포함)
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json(
        { success: false, error: '비밀번호는 대문자, 소문자, 숫자를 모두 포함해야 합니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 업데이트
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('비밀번호 변경 오류:', updateError);
      return NextResponse.json(
        { success: false, error: '비밀번호 변경에 실패했습니다.' },
        { status: 500 }
      );
    }

    const response: ChangePasswordResponse = {
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
