'use client';

import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';

function getActualProvider(user: { app_metadata?: Record<string, unknown> } | null): string {
  if (!user) return '';
  const provider = (user.app_metadata?.provider as string) || '';
  const providers = (user.app_metadata?.providers as string[]) || [];
  const socialProviders = ['google', 'github', 'kakao', 'naver', 'facebook', 'twitter', 'discord'];

  if (socialProviders.includes(provider)) return provider;

  const socialFromProviders = providers.find((p) => socialProviders.includes(p));
  if (socialFromProviders) return socialFromProviders;

  return provider;
}

function ProviderBadge({ provider }: { provider: string }) {
  switch (provider) {
    case 'google':
      return (
        <span className="inline-flex h-5 items-center gap-1 rounded-full bg-white px-1.5 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200">
          <svg width="12" height="12" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </span>
      );
    case 'github':
      return (
        <span className="inline-flex h-5 items-center gap-1 rounded-full bg-gray-900 px-1.5 text-[10px] font-medium text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </span>
      );
    case 'kakao':
      return (
        <span className="inline-flex h-5 items-center gap-1 rounded-full bg-[#FEE500] px-1.5 text-[10px] font-medium text-[#391B1B]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#391B1B">
            <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.8 5.108 4.516 6.467-.147.529-.946 3.406-.978 3.627 0 0-.02.166.087.229.107.063.233.014.233.014.307-.043 3.558-2.328 4.118-2.72.652.096 1.326.147 2.024.147 5.523 0 10-3.463 10-7.764C22 6.463 17.523 3 12 3z" />
          </svg>
          Kakao
        </span>
      );
    case 'naver':
      return (
        <span className="inline-flex h-5 items-center gap-1 rounded-full bg-[#03C75A] px-1.5 text-[10px] font-medium text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
          </svg>
          Naver
        </span>
      );
    default:
      return null;
  }
}

export default function ProfileSection() {
  const { user, loading: authLoading } = useAuth();

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자';
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  if (authLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex animate-pulse items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-gray-100" />
            <div className="flex-1 space-y-2.5">
              <div className="h-5 w-28 rounded bg-gray-100" />
              <div className="h-4 w-44 rounded bg-gray-100" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-5">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-400 dark:bg-gray-800">
              {displayName[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-lg font-semibold">{displayName}</p>
              <ProviderBadge provider={getActualProvider(user)} />
            </div>
            <p className="text-muted-foreground truncate text-sm">{user?.email}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : ''} 가입
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
