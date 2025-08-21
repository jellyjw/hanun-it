'use client';

import { RefreshCw, ImageIcon, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  handleRefreshRSS: () => Promise<void>;
  handleExtractThumbnails?: () => Promise<void>;
  handleRefreshITNews?: () => Promise<void>;
}

export function Header({ handleRefreshRSS, handleExtractThumbnails, handleRefreshITNews }: HeaderProps) {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-lg font-bold transition-colors hover:text-emerald-500 sm:text-xl">
            한눈IT
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
            {!isAuthenticated ? (
              <Link href="/auth/login">
                <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md">
                  로그인
                </button>
              </Link>
            ) : (
              <button 
                onClick={signOut}
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md">
                로그아웃
              </button>
            )}

          {isAdmin && (
            <>
              <Button
                onClick={handleRefreshRSS}
                variant="outline"
                size="sm"
                className="hidden items-center space-x-2 border-purple-200 transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 sm:flex dark:border-purple-800 dark:hover:border-purple-700 dark:hover:bg-purple-950">
                <RefreshCw className="h-4 w-4" />
                <span>새로고침</span>
              </Button>

              {handleRefreshITNews && (
                <Button
                  onClick={handleRefreshITNews}
                  variant="outline"
                  size="sm"
                  className="hidden items-center space-x-2 border-green-200 transition-all duration-200 hover:border-green-300 hover:bg-green-50 sm:flex dark:border-green-800 dark:hover:border-green-700 dark:hover:bg-green-950">
                  <Newspaper className="h-4 w-4" />
                  <span>IT뉴스</span>
                </Button>
              )}

              {handleExtractThumbnails && (
                <Button
                  onClick={handleExtractThumbnails}
                  variant="outline"
                  size="sm"
                  className="hidden items-center space-x-2 border-orange-200 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 sm:flex dark:border-orange-800 dark:hover:border-orange-700 dark:hover:bg-orange-950">
                  <ImageIcon className="h-4 w-4" />
                  <span>썸네일</span>
                </Button>
              )}
            </>
          )}

        </div>
      </div>
    </nav>
  );
}
