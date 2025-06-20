'use client';

import { useEffect, useState } from 'react';
import SocialLogin from '@/components/auth/SocialLogin';
import AuthForm from '@/components/auth/AuthForm';
import { Suspense } from 'react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const errorParam = searchParams.get('error');
  //   if (errorParam === 'auth_failed') {
  //     setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
  //   }
  // }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <AuthForm />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-50 px-2 text-gray-500">또는</span>
          </div>
          {error && <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
        </div>

        <SocialLogin />
      </div>
    </div>
  );
}
