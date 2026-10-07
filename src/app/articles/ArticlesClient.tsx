'use client';

import { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useArticleActions } from '@/hooks/useArticleActions';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { useGetArticles } from '@/hooks/useGetArticles';
import { useGetVideos } from '@/hooks/useGetVideos';
import { SELECT_OPTIONS } from '@/utils/options';
import { ArticlesSkeleton } from '@/components/skeleton/ArticlesSkeleton';
import { PageLoadingSkeleton } from '@/components/skeleton/PageLoadingSkeleton';
import { Header } from '@/components/header/Header';
import { CategorySidebar } from '@/components/sidebar/CategorySidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SearchInput from '@/components/SearchInput';
import SelectBox from '@/components/select/SelectBox';
import { CategoryTabs } from '@/components/articles/CategoryTabs';
import { ArticlesHero } from '@/app/articles/components/ArticlesHero';
import { ArticleGrid } from '@/app/articles/components/ArticleGrid';
import { ArticlesSidebar } from '@/app/articles/components/ArticlesSidebar';

// Module-level constant - no re-creation on each render
const CATEGORY_TITLES: Record<string, string> = {
  domestic: '국내 아티클',
  foreign: '해외 아티클',
  news: 'IT 뉴스',
  'ai-data': 'AI/데이터 사이언스',
  personal: '개인 블로그',
  videos: '인기 영상',
};

function ArticlesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // URL 파라미터에서 초기값 가져오기
  const initialPage = parseInt(searchParams.get('page') || '1');
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'domestic';
  const initialSort = searchParams.get('sort') || 'latest';

  const [page, setPage] = useState(initialPage);
  const [itemsPerPage] = useState(21); // 한 페이지당 21개 (3열 * 7행)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 검색 훅 사용 - 초기값을 URL에서 가져옴
  const { searchValue, debouncedSearchValue, updateSearchValue, isSearching } = useSearch(initialSearch, 800);

  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // URL 업데이트 함수
  const updateURL = useCallback(
    (newParams: { page?: number; search?: string; category?: string; sort?: string }) => {
      const params = new URLSearchParams(searchParams);

      if (newParams.page !== undefined) {
        if (newParams.page === 1) {
          params.delete('page');
        } else {
          params.set('page', newParams.page.toString());
        }
      }

      if (newParams.search !== undefined) {
        if (newParams.search === '') {
          params.delete('search');
        } else {
          params.set('search', newParams.search);
        }
      }

      if (newParams.category !== undefined) {
        params.set('category', newParams.category);
      }

      if (newParams.sort !== undefined) {
        if (newParams.sort === 'latest') {
          params.delete('sort');
        } else {
          params.set('sort', newParams.sort);
        }
      }

      const newURL = params.toString() ? `?${params.toString()}` : '';
      router.push(`/articles${newURL}`, { scroll: false });
    },
    [router, searchParams],
  );

  // URL 파라미터 변경 시 상태 업데이트 (무한 루프 방지)
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'domestic';
    const urlSort = searchParams.get('sort') || 'latest';

    if (urlPage !== page) setPage(urlPage);
    if (urlSearch !== searchValue) updateSearchValue(urlSearch);
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
    if (urlSort !== sortBy) setSortBy(urlSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // debouncedSearchValue 변경 시 URL 업데이트
  useEffect(() => {
    const currentSearchParam = searchParams.get('search') || '';
    if (debouncedSearchValue !== currentSearchParam) {
      updateURL({ search: debouncedSearchValue, page: 1 });
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue]);

  // TanStack Query를 사용한 페이지네이션 - 아티클과 비디오 구분
  const articlesQuery = useGetArticles({
    category: selectedCategory === 'videos' ? 'domestic' : selectedCategory,
    searchValue: selectedCategory === 'videos' ? '' : debouncedSearchValue,
    sort: sortBy,
    page: selectedCategory === 'videos' ? 1 : page,
    limit: selectedCategory === 'videos' ? 1 : itemsPerPage,
  });

  const videosQuery = useGetVideos({
    searchValue: selectedCategory === 'videos' ? debouncedSearchValue : '',
    page: selectedCategory === 'videos' ? page : 1,
    limit: selectedCategory === 'videos' ? itemsPerPage : 1,
  });

  // 현재 선택된 카테고리에 따라 적절한 쿼리 선택
  const { data, isLoading, error, refetch, isPlaceholderData } =
    selectedCategory === 'videos'
      ? {
          ...videosQuery,
          // YouTube API 에러 시 빈 데이터로 처리
          data: videosQuery.error
            ? {
                articles: [],
                pagination: {
                  page: 1,
                  limit: itemsPerPage,
                  total: 0,
                  totalPages: 0,
                  hasNext: false,
                  hasPrev: false,
                },
              }
            : videosQuery.data
              ? {
                  articles: videosQuery.data.videos.map((video) => ({
                    id: video.id,
                    title: video.title,
                    description: video.description,
                    link: `https://www.youtube.com/watch?v=${video.videoId}`,
                    content: video.description,
                    pub_date: video.publishedAt,
                    source_name: video.channelTitle,
                    category: 'videos',
                    is_domestic: false,
                    thumbnail: video.thumbnail,
                    summary: video.description,
                    view_count: video.viewCount,
                    like_count: video.likeCount,
                    videoId: video.videoId,
                    duration: video.duration,
                  })),
                  pagination: videosQuery.data.pagination,
                }
              : null,
          // videos 카테고리에서는 에러를 숨김
          error: null,
        }
      : articlesQuery;

  // 운영(관리자)용 RSS 수집/썸네일 추출 액션
  const { handleRefreshRSS, handleRefreshITNews, handleExtractThumbnails } = useArticleActions({ refetch });

  useEffect(() => {
    if (!isPlaceholderData && data?.pagination.hasNext) {
      if (selectedCategory === 'videos') {
        queryClient.prefetchQuery({
          queryKey: ['videos', debouncedSearchValue, page + 1, itemsPerPage],
          queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedSearchValue) params.append('searchValue', debouncedSearchValue);
            params.append('page', (page + 1).toString());
            params.append('limit', itemsPerPage.toString());

            const response = await fetch(`/api/youtube?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch videos');
            return response.json();
          },
        });
      } else {
        queryClient.prefetchQuery({
          queryKey: ['articles', selectedCategory, debouncedSearchValue, sortBy, page + 1, itemsPerPage],
          queryFn: async () => {
            const params = new URLSearchParams();
            if (selectedCategory) params.append('category', selectedCategory);
            if (debouncedSearchValue) params.append('searchValue', debouncedSearchValue);
            if (sortBy) params.append('sort', sortBy);
            params.append('page', (page + 1).toString());
            params.append('limit', itemsPerPage.toString());

            const response = await fetch(`/api/articles?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch articles');
            return response.json();
          },
        });
      }
    }
  }, [data, isPlaceholderData, page, queryClient, selectedCategory, sortBy, debouncedSearchValue, itemsPerPage]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      updateURL({ page: newPage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateURL],
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      setPage(1);

      // IT 뉴스 카테고리 선택 시 기본 정렬을 최신순으로 설정
      if (category === 'it-news' && sortBy !== 'latest') {
        setSortBy('latest');
        updateURL({ category, page: 1, sort: 'latest' });
      } else {
        updateURL({ category, page: 1 });
      }

      // 카테고리 변경 시 강제 refetch (특히 IT 뉴스의 경우)
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: category === 'it-news' ? ['it-news'] : ['articles'],
        });
        refetch();
      }, 100);
    },
    [sortBy, updateURL, queryClient, refetch],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      setSortBy(value);
      setPage(1);
      updateURL({ sort: value, page: 1 });
    },
    [updateURL],
  );

  // 검색 처리 함수
  const handleSearch = useCallback(
    (value: string) => {
      updateSearchValue(value);
      // 페이지는 debouncedSearchValue 변경 시 URL을 통해 업데이트됨
    },
    [updateSearchValue],
  );

  const categoryTitle = useMemo(() => {
    if (debouncedSearchValue.trim()) {
      return `"${debouncedSearchValue}" 검색 결과`;
    }
    return CATEGORY_TITLES[selectedCategory] || '국내 아티클';
  }, [debouncedSearchValue, selectedCategory]);

  // Image error handler
  const handleImageError = useCallback((articleId: string) => {
    setFailedImages((prev) => new Set(prev).add(articleId));
  }, []);

  // 초기 로딩 시에만 스켈레톤 표시 (데이터가 없을 때)
  // 카테고리 변경이나 페이지 변경 시에는 기존 데이터를 유지하면서 로딩 인디케이터만 표시
  if (isLoading && !isPlaceholderData && !data) {
    return (
      <ArticlesSkeleton
        handleRefreshRSS={handleRefreshRSS}
        handleExtractThumbnails={handleExtractThumbnails}
        handleRefreshITNews={handleRefreshITNews}
        selectedCategory={selectedCategory}
        handleCategoryChange={handleCategoryChange}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        itemsPerPage={itemsPerPage}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          handleRefreshRSS={handleRefreshRSS}
          handleExtractThumbnails={handleExtractThumbnails}
          handleRefreshITNews={handleRefreshITNews}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            <CategorySidebar
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex-1">
              <div className="flex min-h-[400px] items-center justify-center">
                <Card className="w-full max-w-md">
                  <CardHeader className="text-center">
                    <CardTitle className="text-destructive">오류가 발생했습니다</CardTitle>
                    <CardDescription>아티클을 불러올 수 없습니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button onClick={() => refetch()} variant="outline">
                      다시 시도
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header 컴포넌트 사용 */}
      <Header
        handleRefreshRSS={handleRefreshRSS}
        handleExtractThumbnails={handleExtractThumbnails}
        handleRefreshITNews={handleRefreshITNews}
      />

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-3 py-6 sm:px-6 sm:py-12">
        <ArticlesHero />

        {/* 메인 컨텐츠 영역 */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* 왼쪽 메인 컨텐츠 */}
          <div className="flex-1">
            {/* 검색 및 정렬 */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="w-full sm:max-w-md">
                  <SearchInput onSearch={handleSearch} isSearching={isSearching} initialValue={searchValue} />
                </div>
                {selectedCategory !== 'videos' && (
                  <div className="flex justify-end">
                    <SelectBox options={SELECT_OPTIONS.sortBy} value={sortBy} onChange={handleSortChange} />
                  </div>
                )}
              </div>

              {/* 현재 보고 있는 목록 제목 (검색어/카테고리) */}
              <h2 className="sr-only">{categoryTitle}</h2>

              {/* 로딩 상태 표시 */}
              {isPlaceholderData && (
                <div className="mt-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  새로운 데이터를 불러오는 중...
                </div>
              )}

              {/* 카테고리 메뉴 */}
              <CategoryTabs selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
            </div>

            {/* 아티클 그리드 */}
            <ArticleGrid
              articles={data?.articles ?? []}
              selectedCategory={selectedCategory}
              searchValue={debouncedSearchValue}
              failedImages={failedImages}
              onImageError={handleImageError}
            />

            {/* 페이지네이션 */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center sm:mt-8">
                <PaginationWrapper
                  totalItems={data.pagination.total}
                  itemsPerPage={itemsPerPage}
                  initialPage={page}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

          {/* 오른쪽 사이드바 - sticky */}
          <ArticlesSidebar />
        </div>
      </div>
    </div>
  );
}

export default function ArticlesClient() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <ArticlesPageContent />
    </Suspense>
  );
}
