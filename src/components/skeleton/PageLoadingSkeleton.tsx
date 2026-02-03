// 페이지 로딩 시 표시되는 간단한 스켈레톤
const SkeletonArticleCard = () => (
  <div className="group overflow-hidden rounded-lg bg-white shadow-sm">
    <div className="relative aspect-[4/3] overflow-hidden">
      <div className="h-full w-full animate-pulse bg-gray-200"></div>
    </div>
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
        <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200"></div>
      </div>
    </div>
  </div>
);

export const PageLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 바 스켈레톤 */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
          <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
            <div className="h-8 w-20 animate-pulse rounded-full bg-gray-200"></div>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-3 py-6 sm:px-6 sm:py-12">
        {/* 헤더 섹션 */}
        <div className="mb-8 flex flex-col items-center text-center sm:mb-12">
          <div className="mb-4 h-12 w-12 animate-pulse rounded-full bg-gray-200 sm:h-16 sm:w-16"></div>
          <div className="mx-auto mb-4 h-8 w-80 animate-pulse rounded bg-gray-200"></div>
          <div className="mx-auto max-w-2xl space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* 왼쪽 메인 컨텐츠 */}
          <div className="flex-1">
            {/* 검색 및 정렬 */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="w-full sm:max-w-md">
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200"></div>
                </div>
                <div className="flex justify-end">
                  <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>

              {/* 카테고리 메뉴 */}
              <div className="mt-4 overflow-x-auto">
                <div className="flex gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-9 w-20 animate-pulse rounded-lg bg-gray-200"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* 아티클 그리드 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {Array.from({ length: 12 }).map((_, index) => (
                <SkeletonArticleCard key={index} />
              ))}
            </div>
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="mt-6 w-full sm:mt-8 lg:mt-0 lg:w-80">
            <div className="space-y-6 sm:space-y-8">
              <div className="rounded-lg bg-gray-50 p-4 shadow-sm sm:p-6">
                <div className="mb-2 h-6 w-48 animate-pulse rounded bg-gray-200"></div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
