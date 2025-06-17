'use client';

import { RefreshCw, Code2, Zap, User, ImageIcon } from 'lucide-react';
// import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  handleRefreshRSS: () => Promise<void>;
  handleExtractThumbnails?: () => Promise<void>;
}

export function Header({ handleRefreshRSS, handleExtractThumbnails }: HeaderProps) {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 및 브랜드 */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl">
                <Code2 className="w-6 h-6 text-black dark:text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-foreground">한눈IT</h1>
                <p className="text-xs text-muted-foreground">국내, 해외의 IT 최신 아티클을 한눈에</p>
              </div>
            </Link>
          </div>

          {/* 네비게이션 */}
          {/* <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/articles"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              아티클
            </Link>
            <Link
              href="/videos"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              YouTube 영상
            </Link>
            <Link
              href="/trending"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              트렌딩
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              카테고리
            </Link>
          </nav> */}

          {/* 액션 버튼들 */}
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center space-x-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
                  <User className="w-4 h-4" />
                  <span>로그인</span>
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" onClick={signOut}>
                <User className="w-4 h-4" />
                <span>로그아웃</span>
              </Button>
            )}

            {/* 관리자만 새로고침 버튼 표시 */}
            {isAdmin && (
              <>
                <Button
                  onClick={handleRefreshRSS}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center space-x-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
                  <RefreshCw className="w-4 h-4" />
                  <span>새로고침</span>
                </Button>

                {handleExtractThumbnails && (
                  <Button
                    onClick={handleExtractThumbnails}
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex items-center space-x-2 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200">
                    <ImageIcon className="w-4 h-4" />
                    <span>썸네일</span>
                  </Button>
                )}
              </>
            )}

            {/* <ThemeToggle /> */}
          </div>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <Link
              href="/articles"
              className="flex flex-col items-center space-y-1 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors">
              <Code2 className="w-4 h-4" />
              <span>아티클</span>
            </Link>
            <Link
              href="/videos"
              className="flex flex-col items-center space-y-1 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors">
              <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>YouTube</span>
            </Link>

            {/* 모바일에서도 관리자만 새로고침 버튼 표시 */}
            {isAdmin && (
              <>
                <button
                  onClick={handleRefreshRSS}
                  className="flex flex-col items-center space-y-1 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  <span>새로고침</span>
                </button>

                {handleExtractThumbnails && (
                  <button
                    onClick={handleExtractThumbnails}
                    className="flex flex-col items-center space-y-1 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors">
                    <ImageIcon className="w-4 h-4" />
                    <span>썸네일</span>
                  </button>
                )}
              </>
            )}
            {/* <Link
              href="/trending"
              className="flex flex-col items-center space-y-1 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors">
              <Zap className="w-4 h-4" />
              <span>트렌딩</span>
            </Link>
            <Link
              href="/categories"
              className="flex flex-col items-center space-y-1 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors">
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              </div>
              <span>카테고리</span>
            </Link> */}
          </div>
        </nav>
      </div>
    </header>
  );
}
