'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSocialLogin: boolean;
  userProvider: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('세션 조회 오류:', error);
        }

        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('세션 조회 중 예외:', error);
        setUser(null);
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  // 관리자 권한 확인
  useEffect(() => {
    if (!user) {
      setAdminStatus(false);
      return;
    }

    let cancelled = false;
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/admin');
        const data = await res.json();
        if (!cancelled) {
          setAdminStatus(data.isAdmin ?? false);
        }
      } catch {
        if (!cancelled) {
          setAdminStatus(false);
        }
      }
    };

    checkAdmin();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const signOut = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
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
  }, [supabase.auth, router]);

  const isSocialLogin = (() => {
    if (!user) return false;
    const provider = user.app_metadata?.provider;
    const providers = user.app_metadata?.providers || [];
    const socialProviders = ['google', 'github', 'facebook', 'twitter', 'discord', 'kakao', 'naver'];
    return (
      (provider && socialProviders.includes(provider)) || providers.some((p: string) => socialProviders.includes(p))
    );
  })();

  const value: AuthContextValue = {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isAdmin: adminStatus,
    isSocialLogin,
    userProvider: user?.app_metadata?.provider || 'unknown',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
