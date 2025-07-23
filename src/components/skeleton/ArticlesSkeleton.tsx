import { Suspense } from 'react';
import Link from 'next/link';

// 네비게이션 바 스켈레톤
const SkeletonNavigation = () => (
  <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all duration-300">
    <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
      <div className="flex items-center gap-2">
        <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
        <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
        <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
        <div className="h-8 w-20 animate-pulse rounded-full bg-gray-200"></div>
      </div>
    </div>
  </nav>
);

// 헤더 섹션 스켈레톤
const SkeletonHeader = () => (
  <div className="mb-8 text-center sm:mb-12">
    <div className="mx-auto mb-4 h-8 w-80 animate-pulse rounded bg-gray-200"></div>
    <div className="mx-auto max-w-2xl space-y-2">
      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
      <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
    </div>
  </div>
);

// 검색 및 정렬 스켈레톤
const SkeletonSearchAndSort = () => (
  <div className="mb-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full sm:max-w-md">
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200"></div>
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  </div>
);

// 카테고리 탭 스켈레톤
const SkeletonCategoryTabs = () => (
  <div className="mt-4 overflow-x-auto border-b border-gray-200">
    <div className="flex min-w-max gap-8 pb-1">
      <div className="h-6 w-12 animate-pulse rounded border-b-2 border-gray-900 bg-gray-200"></div>
      <div className="h-6 w-12 animate-pulse rounded bg-gray-200"></div>
      <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
      <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
    </div>
  </div>
);

// 아티클 카드 스켈레톤
const SkeletonArticleCard = () => (
  <div className="group overflow-hidden rounded-lg bg-white shadow-sm">
    {/* 썸네일 스켈레톤 */}
    <div className="relative aspect-[4/3] overflow-hidden">
      <div className="h-full w-full animate-pulse bg-gray-200"></div>
    </div>

    {/* 컨텐츠 스켈레톤 */}
    <div className="p-4 sm:p-6">
      <div className="mb-2">
        <div className="h-3 w-20 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="mb-2 space-y-2">
        <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="space-y-1">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="mt-4">
        <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200 sm:w-20"></div>
      </div>
    </div>
  </div>
);

// 사이드바 스켈레톤
const SkeletonSidebar = () => (
  <div className="space-y-8">
    {/* 구독 폼 스켈레톤 */}
    <div className="rounded-lg bg-gray-50 p-4 shadow-sm sm:p-6">
      <div className="mb-2 h-6 w-48 animate-pulse rounded bg-gray-200"></div>
      <div className="mb-4 h-4 w-full animate-pulse rounded bg-gray-200"></div>
      <div className="space-y-2">
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200"></div>
        <div className="h-8 w-full animate-pulse rounded-lg bg-gray-200"></div>
      </div>
    </div>

    {/* 추천 아티클 스켈레톤 */}
    <div className="space-y-4">
      <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-lg bg-gray-50 p-4 shadow-sm">
          <div className="mb-1 h-5 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
      ))}
    </div>
  </div>
);

// 아티클 그리드 스켈레톤
const SkeletonArticleGrid = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonArticleCard key={index} />
    ))}
  </div>
);

interface ArticlesSkeletonProps {
  handleRefreshRSS: () => Promise<void>;
  handleExtractThumbnails: () => Promise<void>;
  handleRefreshITNews: () => Promise<void>;
  selectedCategory: string;
  handleCategoryChange: (category: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  itemsPerPage: number;
}

export const ArticlesSkeleton = ({
  handleRefreshRSS,
  handleExtractThumbnails,
  handleRefreshITNews,
  selectedCategory,
  handleCategoryChange,
  isSidebarOpen,
  setIsSidebarOpen,
  itemsPerPage,
}: ArticlesSkeletonProps) => {
  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 바 스켈레톤 */}
      <SkeletonNavigation />

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* 헤더 섹션 스켈레톤 */}
        <SkeletonHeader />

        {/* 메인 컨텐츠 영역 */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* 왼쪽 메인 컨텐츠 */}
          <div className="flex-1">
            {/* 검색 및 정렬 스켈레톤 */}
            <SkeletonSearchAndSort />

            {/* 카테고리 탭 스켈레톤 */}
            <SkeletonCategoryTabs />

            {/* 아티클 그리드 스켈레톤 */}
            <div className="mt-8">
              <SkeletonArticleGrid count={itemsPerPage} />
            </div>

            {/* 페이지네이션 스켈레톤 */}
            <div className="mt-8 flex justify-center sm:mt-12">
              <div className="flex items-center gap-2">
                <div className="h-10 w-20 animate-pulse rounded bg-gray-200"></div>
                <div className="h-10 w-8 animate-pulse rounded bg-gray-200"></div>
                <div className="h-10 w-8 animate-pulse rounded bg-gray-200"></div>
                <div className="h-10 w-8 animate-pulse rounded bg-gray-200"></div>
                <div className="h-10 w-20 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드바 스켈레톤 */}
          <div className="mt-8 w-full lg:mt-0 lg:w-80">
            <div className="lg:sticky lg:top-24">
              <SkeletonSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
