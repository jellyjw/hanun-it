'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState(false);
  const supabase = createClient();
  const router = useRouter();

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

      // 인증 상태 변경 시 라우터 새로고침
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  const signOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        router.push('/');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('로그아웃 오류:', error);
      }
    } catch (error) {
      console.error('로그아웃 중 예외:', error);
      setUser(null);
      router.push('/');
    }
  };

  // 관리자 권한 확인 (서버 API를 통해 검증)
  useEffect(() => {
    if (!user) {
      setAdminStatus(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/admin');
        const data = await res.json();
        setAdminStatus(data.isAdmin ?? false);
      } catch {
        setAdminStatus(false);
      }
    };

    checkAdmin();
  }, [user]);

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
    isAdmin: adminStatus,
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
