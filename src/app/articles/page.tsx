'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, keepPreviousData, QueryFunctionContext, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, ExternalLink, Globe, MapPin, Loader2, Menu, Eye, MessageCircle, Newspaper } from 'lucide-react';
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

function ArticlesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // URL 파라미터에서 초기값 가져오기
  const initialPage = parseInt(searchParams.get('page') || '1');
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'domestic';
  const initialSort = searchParams.get('sort') || (initialCategory === 'it-news' ? 'latest' : 'popular');

  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [itemsPerPage, setItemsPerPage] = useState(20);
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
        if (newParams.category === 'domestic') {
          params.delete('category');
        } else {
          params.set('category', newParams.category);
        }
      }

      if (newParams.sort !== undefined) {
        if (newParams.sort === 'popular') {
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
    const urlSort = searchParams.get('sort') || 'popular';

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

  const fetchArticles = async (
    page = 0,
  ): Promise<{
    articles: Array<ArticleResponse['article']>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    maxViewCount?: number;
  }> => {
    console.log('🚀 fetchArticles 호출됨:', {
      selectedCategory,
      page,
      debouncedSearchValue,
      sortBy,
      timestamp: new Date().toISOString(),
    });

    const params = new URLSearchParams({
      page: page.toString(),
      searchValue: debouncedSearchValue,
      sort: sortBy,
    });

    // 카테고리 파라미터 추가
    if (selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }

    // IT 뉴스의 경우 별도 API 호출
    const apiUrl = selectedCategory === 'it-news' ? '/api/it-news' : '/api/articles';

    console.log('📡 API 요청:', `${apiUrl}?${params.toString()}`);

    const response = await fetch(`${apiUrl}?${params}`);
    const result = await response.json();

    console.log('📦 API 응답:', {
      success: result.success,
      articlesCount: result.articles?.length || 0,
      total: result.pagination?.total || 0,
    });

    return result;
  };

  // TanStack Query를 사용한 페이지네이션 - IT 뉴스를 위한 별도 처리
  const queryKey =
    selectedCategory === 'it-news'
      ? (['it-news', page, debouncedSearchValue, selectedCategory, sortBy] as const)
      : (['articles', page, debouncedSearchValue, selectedCategory, sortBy] as const);

  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery({
    queryKey,
    queryFn: () => fetchArticles(page),
    placeholderData: keepPreviousData,
    staleTime: selectedCategory === 'it-news' ? 0 : 5 * 60 * 1000, // IT 뉴스는 항상 새로 조회
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });

  useEffect(() => {
    if (!isPlaceholderData && data?.pagination.hasNext) {
      queryClient.prefetchQuery({
        queryKey: selectedCategory === 'it-news' ? ['it-news', page + 1] : ['articles', page + 1],
        queryFn: () => fetchArticles(page + 1),
      });
    }
  }, [data, isPlaceholderData, page, queryClient, selectedCategory, sortBy]);

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
              : '전체 아티클';

    return `${baseTitle}`;
  };

  const preprocessingThumbnail = (article: ArticleResponse['article']) => {
    if (article.thumbnail.includes('https://techblog.woowa.in')) {
      return article.thumbnail.replace('https://techblog.woowa.in', 'https://techblog.woowahan.com');
    } else if (article.thumbnail === '' && article.source_name === '우아한형제들 기술블로그') {
      return 'https://techblog.woowahan.com/wp-content/uploads/2023/02/2023-%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC-%EB%A1%9C%EA%B3%A0-2-e1675772695839.png';
    }
    return article.thumbnail;
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
          <div className="flex-1 space-y-6">
            {/* 검색 입력 섹션 */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-4 w-4" />
                      </Button>
                      <div>
                        <h1 className="mb-1 text-2xl font-bold text-foreground">{getCategoryTitle()}</h1>
                        <p className="text-muted-foreground text-sm">
                          {debouncedSearchValue.trim()
                            ? // ? `${selectedCategory !== 'all' ? getCategoryTitle().split(' 검색')[0] + ' 카테고리에서 ' : ''}검색된 결과입니다`
                              `${selectedCategory !== 'all' ? getCategoryTitle().split(' 검색')[0] + ' ' : ''} 검색 결과입니다.`
                            : selectedCategory === 'weekly'
                              ? '조회수가 높은 인기 아티클을 확인하세요'
                              : selectedCategory === 'domestic'
                                ? '국내 기술 블로그 및 미디어'
                                : selectedCategory === 'foreign'
                                  ? '해외 기술 블로그 및 미디어'
                                  : selectedCategory === 'it-news'
                                    ? '최신 IT 뉴스 및 트렌드를 한눈에'
                                    : '모든 카테고리의 아티클을 한 곳에서'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* <SelectBox
                        options={SELECT_OPTIONS.itemsPerPage}
                        value={itemsPerPage.toString()}
                        onChange={handleItemsPerPageChange}
                      /> */}
                      <SelectBox options={SELECT_OPTIONS.sortBy} value={sortBy} onChange={handleSortChange} />
                    </div>
                  </div>

                  {/* 검색 입력 */}
                  <div className="w-full">
                    <SearchInput onSearch={handleSearch} isSearching={isSearching} initialValue={searchValue} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {data?.pagination && (
              <div>
                <PageInfo
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  totalItems={data.pagination.total}
                  itemsPerPage={data.pagination.limit}
                />
              </div>
            )}

            {/* 로딩 상태 표시 (placeholderData 사용 시) */}
            {isPlaceholderData && (
              <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                새로운 데이터를 불러오는 중...
              </div>
            )}

            {/* 카드형 그리드 레이아웃 */}
            {selectedCategory === 'it-news' ? (
              // IT 뉴스 리스트형 레이아웃
              <div className={`space-y-4 ${isPlaceholderData ? 'opacity-50' : ''}`}>
                {data?.articles && data.articles.length > 0 ? (
                  data.articles.map((article) => (
                    <Card
                      key={article.id}
                      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
                      onClick={() => router.push(`/articles/${article.id}`)}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* 썸네일 섹션 - 리스트형에서는 작게 */}
                          <div className="bg-muted relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                            {(article.thumbnail ||
                              (article.thumbnail === '' && article.source_name === '우아한형제들 기술블로그')) &&
                            !failedImages.has(article.id) ? (
                              <Image
                                src={preprocessingThumbnail(article)}
                                alt={article.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="128px"
                                loading="lazy"
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

                            {/* IT 뉴스는 배지 없음 */}
                          </div>

                          {/* 콘텐츠 섹션 */}
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-start justify-between">
                              <CardTitle className="group-hover:text-primary line-clamp-2 text-base font-semibold leading-tight transition-colors">
                                {article.title}
                              </CardTitle>

                              {/* HOT 뱃지 */}
                              {data?.maxViewCount &&
                                article.view_count === data.maxViewCount &&
                                article.view_count > 0 && (
                                  <Badge variant="hot" size="sm" showIcon={true} className="ml-2 flex-shrink-0">
                                    HOT
                                  </Badge>
                                )}
                            </div>

                            <CardDescription className="mb-3 line-clamp-2 text-sm">
                              {article.description}
                            </CardDescription>

                            <div className="text-muted-foreground flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                <span className="truncate font-medium text-foreground">{article.source_name}</span>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{(article.view_count || 0).toLocaleString()}</span>
                                </div>
                                {article.comment_count !== undefined && article.comment_count > 0 && (
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3" />
                                    <span>{article.comment_count.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(article.pub_date).toLocaleDateString('ko-KR', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="py-12 text-center">
                    <CardContent>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                          <Newspaper className="text-muted-foreground h-8 w-8" />
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-2 text-lg font-medium">
                            {debouncedSearchValue.trim() ? '검색 결과가 없습니다' : 'IT 뉴스가 없습니다'}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {debouncedSearchValue.trim()
                              ? '다른 검색어를 시도해보거나 카테고리를 변경해보세요'
                              : '새로운 IT 뉴스를 기다려주세요'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              // 기존 그리드형 레이아웃
              <div
                className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isPlaceholderData ? 'opacity-50' : ''}`}>
                {data?.articles && data.articles.length > 0 ? (
                  data.articles.map((article) => (
                    <Card
                      key={article.id}
                      className="group flex cursor-pointer flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                      onClick={() => router.push(`/articles/${article.id}`)}>
                      {/* 썸네일 섹션 */}
                      <div className="bg-muted relative aspect-video overflow-hidden">
                        {(article.thumbnail ||
                          (article.thumbnail === '' && article.source_name === '우아한형제들 기술블로그')) &&
                        !failedImages.has(article.id) ? (
                          <Image
                            src={preprocessingThumbnail(article)}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            loading="lazy"
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

                        {/* 국내/해외 배지와 HOT 배지 */}
                        <div className="absolute right-2 top-2 flex gap-1">
                          {/* HOT 뱃지 - 조회수가 최대인 아티클에만 표시 */}
                          {data?.maxViewCount && article.view_count === data.maxViewCount && article.view_count > 0 && (
                            <Badge variant="hot" size="sm" showIcon={true}>
                              HOT
                            </Badge>
                          )}

                          {/* 국내/해외 배지 */}
                          <Badge
                            variant={article.is_domestic ? 'success-medium' : 'info-medium'}
                            size="sm"
                            showIcon={false}
                            className="border-0">
                            {article.is_domestic ? (
                              <>
                                <MapPin className="mr-1 h-3 w-3" />
                                국내
                              </>
                            ) : (
                              <>
                                <Globe className="mr-1 h-3 w-3" />
                                해외
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      {/* 콘텐츠 섹션 */}
                      <CardContent className="flex-1 p-4">
                        <CardTitle className="group-hover:text-primary mb-2 line-clamp-2 min-h-[2.1875rem] text-sm font-semibold leading-tight transition-colors">
                          {article.title}
                        </CardTitle>

                        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
                          <span className="truncate font-medium text-foreground">{article.source_name}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{(article.view_count || 0).toLocaleString()}</span>
                          </div>
                          {article.comment_count !== undefined && article.comment_count > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                <span>{article.comment_count.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                        </div>

                        <CardDescription className="mb-3 line-clamp-2 min-h-[2rem] text-xs">
                          {article.description}
                        </CardDescription>

                        <div className="text-muted-foreground flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(article.pub_date).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full">
                    <Card className="py-12 text-center">
                      <CardContent>
                        <div className="flex flex-col items-center space-y-4">
                          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                            <Globe className="text-muted-foreground h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-2 text-lg font-medium">
                              {debouncedSearchValue.trim() ? '검색 결과가 없습니다' : '아티클이 없습니다'}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {debouncedSearchValue.trim()
                                ? '다른 검색어를 시도해보거나 카테고리를 변경해보세요'
                                : '다른 카테고리를 선택하거나 RSS를 새로고침해보세요'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <PaginationWrapper
                  totalItems={data.pagination.total}
                  itemsPerPage={itemsPerPage}
                  initialPage={page}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
          {/* <div className="w-64">
          <WeeklyPopularSidebar />
        </div> */}
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
