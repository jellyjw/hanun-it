'use client';

import { RefreshCw, Code2, Zap, User, ImageIcon, Newspaper } from 'lucide-react';
// import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

interface HeaderProps {
  handleRefreshRSS: () => Promise<void>;
  handleExtractThumbnails?: () => Promise<void>;
  handleRefreshITNews?: () => Promise<void>;
}

export function Header({ handleRefreshRSS, handleExtractThumbnails, handleRefreshITNews }: HeaderProps) {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 및 브랜드 */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center gap-2">
              {/* <div className="flex items-center justify-center w-10 h-10 rounded-xl">
                <Code2 className="w-6 h-6 text-black dark:text-white" />
              </div> */}
              <Image src="/logo/code.png" alt="한눈IT" width={40} height={40} />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-foreground">한눈IT</h1>
                <p className="text-muted-foreground text-xs">국내, 해외의 IT 최신 아티클을 한눈에</p>
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
                  className="hidden items-center space-x-2 border-purple-200 transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 sm:flex dark:border-purple-800 dark:hover:border-purple-700 dark:hover:bg-purple-950">
                  <User className="h-4 w-4" />
                  <span>로그인</span>
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" onClick={signOut}>
                <User className="h-4 w-4" />
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

            {/* <ThemeToggle /> */}
          </div>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      <div className="border-t border-border/40 bg-background/95 backdrop-blur md:hidden">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <Link
              href="/articles"
              className="flex flex-col items-center space-y-1 text-xs font-medium text-foreground/80 transition-colors hover:text-foreground">
              <Code2 className="h-4 w-4" />
              <span>아티클</span>
            </Link>
            <Link
              href="/videos"
              className="flex flex-col items-center space-y-1 text-xs font-medium text-foreground/80 transition-colors hover:text-foreground">
              <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-gradient-to-r from-red-500 to-orange-500">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
              <span>YouTube</span>
            </Link>

            {/* 모바일에서도 관리자만 새로고침 버튼 표시 */}
            {isAdmin && (
              <>
                <button
                  onClick={handleRefreshRSS}
                  className="flex flex-col items-center space-y-1 text-xs font-medium text-foreground/80 transition-colors hover:text-foreground">
                  <RefreshCw className="h-4 w-4" />
                  <span>새로고침</span>
                </button>

                {handleRefreshITNews && (
                  <button
                    onClick={handleRefreshITNews}
                    className="flex flex-col items-center space-y-1 text-xs font-medium text-foreground/80 transition-colors hover:text-foreground">
                    <Newspaper className="h-4 w-4" />
                    <span>IT뉴스</span>
                  </button>
                )}

                {handleExtractThumbnails && (
                  <button
                    onClick={handleExtractThumbnails}
                    className="flex flex-col items-center space-y-1 text-xs font-medium text-foreground/80 transition-colors hover:text-foreground">
                    <ImageIcon className="h-4 w-4" />
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
