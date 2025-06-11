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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 오류:', error);
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

    return userRole === 'admin' || (userEmail && adminEmails.includes(userEmail));
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isAdmin: isAdmin(),
  };
}
