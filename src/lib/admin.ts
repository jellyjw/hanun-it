import { SupabaseClient } from '@supabase/supabase-js';

/**
 * 서버 전용 관리자 권한 검증
 * ADMIN_EMAILS 환경 변수 (서버 전용, NEXT_PUBLIC_ 아님)를 사용합니다.
 */
export async function checkIsAdmin(supabase: SupabaseClient): Promise<boolean> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return false;

  const userRole = user.user_metadata?.role;
  if (userRole === 'admin') return true;

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);
  return !!user.email && adminEmails.includes(user.email);
}
