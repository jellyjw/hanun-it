import { Card, CardContent } from '../ui/card';
import { Suspense } from 'react';
import { Header } from '../header/Header';
import { CategorySidebar } from '../sidebar/CategorySidebar';

// 스켈레톤 카드 컴포넌트
const SkeletonCard = () => (
  <Card className="overflow-hidden flex flex-col animate-pulse">
    {/* 썸네일 스켈레톤 */}
    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
      <div className="absolute top-2 right-2 flex gap-1">
        <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>

    {/* 콘텐츠 스켈레톤 */}
    <CardContent className="p-4 flex-1 space-y-3">
      {/* 제목 스켈레톤 */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>

      {/* 메타 정보 스켈레톤 */}
      <div className="flex items-center gap-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
      </div>

      {/* 설명 스켈레톤 */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>

      {/* 날짜 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </CardContent>
  </Card>
);

const SkeletonSearch = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="md:hidden w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
              </div>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
};

// 스켈레톤 그리드 컴포넌트
const SkeletonGrid = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
