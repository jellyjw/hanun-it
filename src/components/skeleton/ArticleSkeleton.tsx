export const ArticleSkeleton = () => {
  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="animate-pulse">
        {/* 뒤로가기 버튼 스켈레톤 */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* 메타 정보 스켈레톤 */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-6 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* 제목 스켈레톤 */}
          <div className="mb-4 space-y-2">
            <div className="h-8 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* 원문 출처 박스 스켈레톤 */}
          <div className="mb-6 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>

        {/* 아티클 내용 스켈레톤 */}
        <div className="mb-8 space-y-4">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-32 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-24 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* 댓글 섹션 스켈레톤 */}
        <div className="space-y-4">
          <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 액션 스켈레톤 */}
        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
