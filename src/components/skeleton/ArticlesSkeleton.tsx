import { Card, CardContent } from '../ui/card';
import { Suspense } from 'react';
import { Header } from '../header/Header';
import { CategorySidebar } from '../sidebar/CategorySidebar';

// 스켈레톤 카드 컴포넌트
const SkeletonCard = () => (
  <Card className="flex animate-pulse flex-col overflow-hidden">
    {/* 썸네일 스켈레톤 */}
    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
      <div className="absolute right-2 top-2 flex gap-1">
        <div className="h-6 w-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
      </div>
    </div>

    {/* 콘텐츠 스켈레톤 */}
    <CardContent className="flex-1 space-y-3 p-4">
      {/* 제목 스켈레톤 */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* 메타 정보 스켈레톤 */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* 설명 스켈레톤 */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* 날짜 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-3 w-3 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </CardContent>
  </Card>
);

const SkeletonSearch = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 animate-pulse rounded bg-gray-200 md:hidden dark:bg-gray-700"></div>
              <div>
                <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
          <div className="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </CardContent>
    </Card>
  );
};

// 스켈레톤 그리드 컴포넌트
const SkeletonGrid = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

interface ArticlesSkeletonProps {
  handleRefreshRSS: () => Promise<void>;
  handleExtractThumbnails: () => Promise<void>;
  selectedCategory: string;
  handleCategoryChange: (category: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  itemsPerPage: number;
}

export const ArticlesSkeleton = ({
  handleRefreshRSS,
  handleExtractThumbnails,
  selectedCategory,
  handleCategoryChange,
  isSidebarOpen,
  setIsSidebarOpen,
  itemsPerPage,
}: ArticlesSkeletonProps) => {
  return (
    <Suspense fallback={<SkeletonSearch />}>
      <div className="min-h-screen bg-background">
        <Header handleRefreshRSS={handleRefreshRSS} handleExtractThumbnails={handleExtractThumbnails} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            <CategorySidebar
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex-1 space-y-6">
              <SkeletonSearch />

              <SkeletonGrid count={itemsPerPage} />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};
