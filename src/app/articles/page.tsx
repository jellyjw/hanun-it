'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, keepPreviousData, QueryFunctionContext, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  Loader2,
  Menu,
  Eye,
  MessageCircle,
  Newspaper,
  RefreshCw,
  ImageIcon,
  Play,
  Clock,
} from 'lucide-react';
import PageInfo from '@/components/pagination/PageInfo';
import { Header } from '@/components/header/Header';
import { CategorySidebar } from '@/components/sidebar/CategorySidebar';
import { ArticleResponse, ArticlesResponse } from '@/types/articles';
import SelectBox from '@/components/select/SelectBox';
import { SELECT_OPTIONS } from '@/utils/options';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SearchInput from '@/components/SearchInput';
import { useSearch } from '@/hooks/useSearch';
import FallbackThumbnail from '@/components/FallbackThumbnail';
import Image from 'next/image';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { useToast } from '@/hooks/use-toast';
import { Suspense } from 'react';
import { ArticlesSkeleton } from '@/components/skeleton/ArticlesSkeleton';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

import { useGetArticles } from '@/hooks/useGetArticles';
import { useGetVideos } from '@/hooks/useGetVideos';

function ArticlesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // URL 파라미터에서 초기값 가져오기
  const initialPage = parseInt(searchParams.get('page') || '1');
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'domestic';
  const initialSort = searchParams.get('sort') || 'latest';

  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [itemsPerPage, setItemsPerPage] = useState(21); // 3의 배수로 변경 (7행 * 3열)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 검색 훅 사용 - 초기값을 URL에서 가져옴
  const { searchValue, debouncedSearchValue, updateSearchValue, isSearching } = useSearch(initialSearch, 800);

  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const { user, signOut, isAdmin } = useAuth();

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
        if (newParams.category === 'domestic') {
          params.delete('category');
        } else {
          params.set('category', newParams.category);
        }
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
  }, [searchParams.toString()]);

  // debouncedSearchValue 변경 시 URL 업데이트
  useEffect(() => {
    const currentSearchParam = searchParams.get('search') || '';
    if (debouncedSearchValue !== currentSearchParam) {
      updateURL({ search: debouncedSearchValue, page: 1 });
      setPage(1);
    }
  }, [debouncedSearchValue]);

  // TanStack Query를 사용한 페이지네이션 - 아티클과 비디오 구분
  const articlesQuery = useGetArticles({
    category: selectedCategory === 'videos' ? 'all' : selectedCategory,
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
          data: videosQuery.data
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
        }
      : articlesQuery;

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
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
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

  const handleRefreshRSS = async () => {
    try {
      const response = await fetch('/api/rss');
      const result = await response.json();
      if (result.success) {
        console.log(result, 'result');
        toast({
          title: `${result.articles}개의 새로운 아티클을 수집했습니다. (썸네일 ${result.thumbnailsExtracted || 0}개 추출)`,
          variant: 'success',
        });
        refetch();
      }
    } catch {
      toast({
        title: 'RSS 수집 중 오류가 발생했습니다.',
        variant: 'error',
      });
    }
  };

  const handleRefreshITNews = async () => {
    try {
      const response = await fetch('/api/it-news/rss');
      const result = await response.json();
      if (result.success) {
        console.log(result, 'it-news result');
        toast({
          title: `${result.articles}개의 새로운 IT 뉴스를 수집했습니다. (썸네일 ${result.thumbnailsExtracted || 0}개 추출)`,
          variant: 'success',
        });
        refetch();
      }
    } catch {
      toast({
        title: 'IT 뉴스 RSS 수집 중 오류가 발생했습니다.',
        variant: 'error',
      });
    }
  };

  const handleExtractThumbnails = async () => {
    try {
      toast({
        title: '기존 아티클의 썸네일을 추출하고 있습니다...',
        variant: 'default',
      });

      const response = await fetch('/api/articles/extract-thumbnails', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        toast({
          title: `${result.processed}개 아티클 중 ${result.extracted}개의 썸네일을 추출했습니다.`,
          variant: 'success',
        });
        refetch();
      } else {
        toast({
          title: result.error || '썸네일 추출 중 오류가 발생했습니다.',
          variant: 'error',
        });
      }
    } catch {
      toast({
        title: '썸네일 추출 중 오류가 발생했습니다.',
        variant: 'error',
      });
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    console.log('🔄 카테고리 변경:', { from: selectedCategory, to: category });
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
      console.log('🔄 강제 refetch 실행');
      // 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: category === 'it-news' ? ['it-news'] : ['articles'],
      });
      refetch();
    }, 100);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
    updateURL({ sort: value, page: 1 });
  };

  // 검색 처리 함수
  const handleSearch = useCallback(
    (value: string) => {
      updateSearchValue(value);
      // 페이지는 debouncedSearchValue 변경 시 URL을 통해 업데이트됨
    },
    [updateSearchValue],
  );

  // 페이지당 아이템 수 변경 처리
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = Number(value);
    setItemsPerPage(newItemsPerPage);
    setPage(1);
  };

  const getCategoryTitle = () => {
    const sortLabel = SELECT_OPTIONS.sortBy.find((option) => option.value === sortBy)?.label || '인기순';

    if (debouncedSearchValue.trim()) {
      return `"${debouncedSearchValue}" 검색 결과`;
    }

    const baseTitle =
      selectedCategory === 'weekly'
        ? '주간 인기 아티클'
        : selectedCategory === 'domestic'
          ? '국내 아티클'
          : selectedCategory === 'foreign'
            ? '해외 아티클'
            : selectedCategory === 'it-news'
              ? 'IT 뉴스'
              : selectedCategory === 'videos'
                ? '인기 영상'
                : '전체 아티클';

    return `${baseTitle}`;
  };

  const preprocessingThumbnail = (article: ArticleResponse['article']) => {
    let thumbnail = article.thumbnail;

    // 우아한형제들 블로그 URL 수정
    if (thumbnail.includes('https://techblog.woowa.in')) {
      thumbnail = thumbnail.replace('https://techblog.woowa.in', 'https://techblog.woowahan.com');
    } else if (thumbnail === '' && article.source_name === '우아한형제들 기술블로그') {
      return 'https://techblog.woowahan.com/wp-content/uploads/2023/02/2023-%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC-%EB%A1%9C%EA%B3%A0-2-e1675772695839.png';
    }

    // YouTube 썸네일 크기 최적화 - 모든 경우에 적용
    if (article.category === 'videos' && thumbnail.includes('i.ytimg.com')) {
      // 다양한 YouTube 썸네일 크기를 mqdefault로 통일 (320x180)
      thumbnail = thumbnail
        .replace('maxresdefault', 'mqdefault')
        .replace('hqdefault', 'mqdefault')
        .replace('sddefault', 'mqdefault');
    }

    return thumbnail;
  };

  if (isLoading && !isPlaceholderData) {
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
      {/* 네비게이션 바 - sticky + 스크롤 효과 */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all duration-300">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">한눈IT</span>
          </div>
          {/* <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Analytics
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Resources
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Products
            </a>
            <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md">
              Subscribe
            </button>
          </div> */}
          <div className="flex items-center gap-2">
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
            {user ? (
              <button
                onClick={signOut}
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md">
                로그아웃
              </button>
            ) : (
              <Link href="/auth/login">
                <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md">
                  로그인
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* 헤더 섹션 */}
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">한눈에 모아보는 IT 뉴스</h1>
          <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
            최신 IT 뉴스와 기술 아티클, 인기 영상을 한눈에 모아보세요.
          </p>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* 왼쪽 메인 컨텐츠 */}
          <div className="flex-1">
            {/* 검색 및 정렬 */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-md">
                  <SearchInput onSearch={handleSearch} isSearching={isSearching} initialValue={searchValue} />
                </div>
                {selectedCategory !== 'videos' && (
                  <div className="flex justify-end">
                    <SelectBox options={SELECT_OPTIONS.sortBy} value={sortBy} onChange={handleSortChange} />
                  </div>
                )}
              </div>

              {/* 로딩 상태 표시 */}
              {isPlaceholderData && (
                <div className="mt-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  새로운 데이터를 불러오는 중...
                </div>
              )}

              {/* 카테고리 탭 */}
              <div className="mt-4 overflow-x-auto border-b border-gray-200">
                <div className="flex min-w-max gap-8 pb-1">
                  <button
                    onClick={() => handleCategoryChange('domestic')}
                    className={`whitespace-nowrap pb-4 text-sm font-medium transition-colors ${
                      selectedCategory === 'domestic'
                        ? 'border-b-2 border-gray-900 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}>
                    국내
                  </button>
                  <button
                    onClick={() => handleCategoryChange('foreign')}
                    className={`whitespace-nowrap pb-4 text-sm font-medium transition-colors ${
                      selectedCategory === 'foreign'
                        ? 'border-b-2 border-gray-900 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}>
                    해외
                  </button>
                  <button
                    onClick={() => handleCategoryChange('it-news')}
                    className={`whitespace-nowrap pb-4 text-sm font-medium transition-colors ${
                      selectedCategory === 'it-news'
                        ? 'border-b-2 border-gray-900 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}>
                    IT News
                  </button>
                  <button
                    onClick={() => handleCategoryChange('videos')}
                    className={`whitespace-nowrap pb-4 text-sm font-medium transition-colors ${
                      selectedCategory === 'videos'
                        ? 'border-b-2 border-gray-900 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}>
                    인기 영상
                  </button>
                  {/* <button className="whitespace-nowrap pb-4 text-sm font-medium text-gray-500 hover:text-gray-900">
                    Sports
                  </button>
                  <button className="whitespace-nowrap pb-4 text-sm font-medium text-gray-500 hover:text-gray-900">
                    Finance
                  </button> */}
                </div>
              </div>
            </div>

            {/* 아티클 그리드 - Flexbox 레이아웃으로 개선 */}
            <div className="flex flex-wrap gap-6 lg:gap-8">
              {data?.articles && data.articles.length > 0 ? (
                data.articles.map((article) => (
                  <div
                    key={article.id}
                    className="group flex max-h-[480px] min-h-0 w-full cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.333rem)]"
                    onClick={() => {
                      if (article.category === 'videos' && (article as any).videoId) {
                        window.open(`https://www.youtube.com/watch?v=${(article as any).videoId}`, '_blank');
                      } else {
                        router.push(`/articles/${article.id}`);
                      }
                    }}>
                    {/* 썸네일 - 고정 높이와 추가 제한 */}
                    <div
                      className={`relative w-full overflow-hidden bg-gray-100 ${
                        article.category === 'videos' ? 'h-48 max-h-48' : 'h-56 max-h-56'
                      }`}
                      style={{
                        minHeight: article.category === 'videos' ? '192px' : '224px',
                        maxHeight: article.category === 'videos' ? '192px' : '224px',
                      }}>
                      {(article.thumbnail ||
                        (article.thumbnail === '' && article.source_name === '우아한형제들 기술블로그')) &&
                      !failedImages.has(article.id) ? (
                        <Image
                          src={preprocessingThumbnail(article)}
                          alt={article.title}
                          fill
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes={
                            article.category === 'videos'
                              ? '320px'
                              : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                          }
                          loading="lazy"
                          priority={false}
                          style={{
                            maxHeight: article.category === 'videos' ? '192px' : '224px',
                            objectFit: 'cover',
                          }}
                          onError={() => {
                            setFailedImages((prev) => new Set(prev).add(article.id));
                          }}
                        />
                      ) : (
                        <FallbackThumbnail
                          title={article.title}
                          category={undefined}
                          sourceName={article.source_name}
                          isDomestic={article.is_domestic}
                        />
                      )}

                      {/* 비디오인 경우 재생 버튼과 길이 표시 */}
                      {article.category === 'videos' && (
                        <>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 shadow-lg">
                              <Play className="ml-0.5 h-6 w-6 text-white" fill="currentColor" />
                            </div>
                          </div>
                          {(article as any).duration && (
                            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
                              {(article as any).duration}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* 컨텐츠 */}
                    <div className="flex flex-1 flex-col p-4 sm:p-6">
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`text-xs font-medium ${
                            article.category === 'videos' ? 'text-red-600' : 'text-emerald-600'
                          }`}>
                          {article.source_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(article.pub_date).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 sm:text-lg">
                        {article.title}
                      </h3>
                      <p className="line-clamp-2 flex-1 text-sm text-gray-600">{article.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          className={`rounded-full px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:shadow-md sm:px-6 ${
                            article.category === 'videos'
                              ? 'bg-red-500 hover:bg-red-600'
                              : 'bg-emerald-500 hover:bg-emerald-600'
                          }`}>
                          {article.category === 'videos' ? 'Watch Video' : 'Read More'}
                        </button>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          {article.category === 'videos' && article.view_count ? (
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.view_count.toLocaleString()}</span>
                            </div>
                          ) : (article.like_count || 0) > 0 ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs">❤️</span>
                              <span>{article.like_count}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full">
                  <div className="rounded-lg bg-gray-50 py-12 text-center">
                    <div className="mx-auto max-w-sm px-4">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">No articles found</h3>
                      <p className="text-sm text-gray-600">
                        {debouncedSearchValue.trim() ? '다른 검색어를 시도해보세요' : '아직 등록된 아티클이 없습니다'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 구독 섹션 */}
            {/* <div className="my-12 overflow-hidden rounded-xl bg-gradient-to-r from-pink-50 via-yellow-50 to-sky-50 px-4 py-12 sm:my-24 sm:px-8 sm:py-16">
              <div className="relative"> */}
            {/* 장식용 원형 그라데이션 */}
            {/* <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-pink-100 to-pink-50 opacity-50 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-sky-100 to-sky-50 opacity-50 blur-3xl" /> */}

            {/* 컨텐츠 */}
            {/* <div className="relative mx-auto max-w-2xl text-center">
                  <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Subscribe Blog for latest updates
                  </h2>
                  <p className="mb-6 text-base text-gray-600 sm:mb-8 sm:text-lg">
                    Lorem ipsum dolor sit amet conetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
                    dolore magna alique.
                  </p>
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-2">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="w-full max-w-sm rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-base backdrop-blur-sm focus:border-emerald-500 focus:outline-none sm:px-6 sm:py-3"
                    />
                    <button className="w-full rounded-full bg-emerald-500 px-4 py-2 text-base font-medium text-white hover:bg-emerald-600 sm:w-auto sm:px-8 sm:py-3">
                      Subscribe Now
                    </button>
                  </div>
                </div>
              </div>
            </div> */}

            {/* 페이지네이션 */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center sm:mt-12">
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
          <div className="mt-8 w-full lg:mt-0 lg:w-80">
            <div className="space-y-8 lg:sticky lg:top-24 lg:transition-all lg:duration-300">
              {/* 구독 폼 */}
              {/* <div className="rounded-lg bg-gray-50 p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Subscribe Blog for latest updates</h3>
                <p className="mb-4 text-sm text-gray-600">Get the latest news and updates delivered to your inbox.</p>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm transition-colors focus:border-emerald-500 focus:outline-none"
                  />
                  <button className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md">
                    Subscribe
                  </button>
                </div>
              </div> */}

              {/* 추천 아티클 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Popular Articles</h3>
                {data?.articles?.slice(0, 3).map((article) => (
                  <div
                    key={article.id}
                    className="cursor-pointer rounded-lg bg-gray-50 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-md"
                    onClick={() => router.push(`/articles/${article.id}`)}>
                    <h4 className="mb-1 line-clamp-2 font-medium text-gray-900">{article.title}</h4>
                    <p className="text-sm text-gray-600">{article.source_name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArticlesPageContent />
    </Suspense>
  );
}
