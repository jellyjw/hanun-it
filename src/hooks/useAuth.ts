'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 현재 세션 가져오기
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('세션 조회 오류:', error);
        }

        const currentUser = session?.user ?? null;
        console.log('🔐 현재 사용자 세션:', {
          user: currentUser
            ? {
                id: currentUser.id,
                email: currentUser.email,
                provider: currentUser.app_metadata?.provider,
                providers: currentUser.app_metadata?.providers,
                loginMethod: currentUser.user_metadata?.provider || 'unknown',
              }
            : null,
          hasSession: !!session,
        });

        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        console.error('세션 조회 중 예외:', error);
        setUser(null);
        setLoading(false);
      }
    };

    getSession();

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 인증 상태 변경:', {
        event,
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              provider: session.user.app_metadata?.provider,
              providers: session.user.app_metadata?.providers,
              loginMethod: session.user.user_metadata?.provider || 'unknown',
            }
          : null,
        hasSession: !!session,
      });

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = async () => {
    try {
      console.log('🚪 로그아웃 시도...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('로그아웃 오류:', error);
      } else {
        console.log('✅ 로그아웃 성공');
      }
    } catch (error) {
      console.error('로그아웃 중 예외:', error);
    }
  };

  // 관리자 권한 확인 함수
  const isAdmin = () => {
    if (!user) return false;

    // 환경변수에서 관리자 이메일 목록 가져오기 (쉼표로 구분)
    const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'greenery.dev@gmail.com,admin@hanunit.com';
    const adminEmails = adminEmailsEnv.split(',').map((email) => email.trim());

    // 사용자 메타데이터에서 role 확인 또는 이메일 기반 확인
    const userRole = user.user_metadata?.role;
    const userEmail = user.email;

    const adminStatus = userRole === 'admin' || (userEmail && adminEmails.includes(userEmail));

    console.log('👑 관리자 권한 확인:', {
      userEmail,
      userRole,
      adminEmails,
      isAdmin: adminStatus,
    });

    return adminStatus;
  };

  // 소셜 로그인 사용자인지 확인하는 함수 추가
  const isSocialLogin = () => {
    if (!user) return false;

    const provider = user.app_metadata?.provider;
    const providers = user.app_metadata?.providers || [];

    // 소셜 로그인 제공자들
    const socialProviders = ['google', 'github', 'facebook', 'twitter', 'discord', 'kakao', 'naver'];

    return (
      (provider && socialProviders.includes(provider)) || providers.some((p: string) => socialProviders.includes(p))
    );
  };

  const authInfo = {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isAdmin: isAdmin(),
    isSocialLogin: isSocialLogin(),
    userProvider: user?.app_metadata?.provider || 'unknown',
  };

  console.log('🔐 useAuth 반환값:', {
    isAuthenticated: authInfo.isAuthenticated,
    isAdmin: authInfo.isAdmin,
    isSocialLogin: authInfo.isSocialLogin,
    userProvider: authInfo.userProvider,
    userEmail: user?.email,
  });

  return authInfo;
}
