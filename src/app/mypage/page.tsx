'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProfileSection from './components/ProfileSection';
import PasswordChangeForm from './components/PasswordChangeForm';
import LikedArticlesSection from './components/LikedArticlesSection';
import RecentViewsSection from './components/RecentViewsSection';
import NewsletterSection from './components/NewsletterSection';
import Link from 'next/link';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <div className="mb-6">
          <Link href="/" className="text-muted-foreground text-sm transition-colors hover:text-foreground">
            &larr; 목록으로 돌아가기
          </Link>
          <h1 className="mt-4 text-xl font-bold">마이페이지</h1>
        </div>

        <div className="space-y-5">
          <ProfileSection />
          <NewsletterSection />
          <PasswordChangeForm />
          <LikedArticlesSection />
          <RecentViewsSection />
        </div>
      </div>
    </ProtectedRoute>
  );
}
