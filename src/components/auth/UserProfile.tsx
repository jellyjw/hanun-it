'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function UserProfile() {
  const { user, loading, signOut, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button asChild>
        <a href="/auth/login">로그인</a>
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {user?.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} alt="프로필" className="h-8 w-8 rounded-full" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
            <User className="h-4 w-4 text-gray-600" />
          </div>
        )}
        <span className="text-sm font-medium">
          {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '사용자'}
        </span>
      </div>

      <Button onClick={signOut} variant="outline" size="sm" className="flex items-center space-x-1">
        <LogOut className="h-4 w-4" />
        <span>로그아웃</span>
      </Button>
    </div>
  );
}
