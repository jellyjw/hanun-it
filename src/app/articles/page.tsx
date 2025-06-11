'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, keepPreviousData, QueryFunctionContext, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, ExternalLink, Globe, MapPin, Loader2, Menu, Eye, MessageCircle } from 'lucide-react';
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

export default function ArticlesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedCategory, setSelectedCategory] = useState('domestic');
  const [sortBy, setSortBy] = useState('popular');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 검색 훅 사용 - 초기값을 URL에서 가져옴
  const { searchValue, debouncedSearchValue, updateSearchValue, isSearching } = useSearch(search || '', 800);

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
    const params = new URLSearchParams({
      page: page.toString(),
      searchValue: searchValue,
      sort: sortBy,
    });

    // 카테고리 파라미터 추가
    if (selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }

    const response = await fetch(`/api/articles?${params}`);
    return await response.json();
  };

  // TanStack Query를 사용한 페이지네이션
  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery({
    queryKey: ['articles', page, searchValue, selectedCategory, sortBy] as const,
    queryFn: () => fetchArticles(page),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });

  useEffect(() => {
    if (!isPlaceholderData && data?.pagination.hasNext) {
      queryClient.prefetchQuery({
        queryKey: ['articles', page + 1],
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
        // refetch();
      }
    } catch {
      toast({
        title: 'RSS 수집 중 오류가 발생했습니다.',
        variant: 'error',
      });
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  // 검색 처리 함수
  const handleSearch = useCallback(
    (value: string) => {
      updateSearchValue(value);
      setPage(1);
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
      <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen bg-background">
          <Header handleRefreshRSS={handleRefreshRSS} />
          <div className="container mx-auto px-4 py-8">
            <div className="flex gap-6">
              <CategorySidebar
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
              />
              <div className="flex-1">
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">아티클을 불러오는 중...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    );
  }

  if (error) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen bg-background">
          <Header handleRefreshRSS={handleRefreshRSS} />
          <div className="container mx-auto px-4 py-8">
            <div className="flex gap-6">
              <CategorySidebar
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
              />
              <div className="flex-1">
                <div className="flex items-center justify-center min-h-[400px]">
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
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-background">
        <Header handleRefreshRSS={handleRefreshRSS} />

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
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="md:hidden"
                          onClick={() => setIsSidebarOpen(true)}>
                          <Menu className="w-4 h-4" />
                        </Button>
                        <div>
                          <h1 className="text-2xl font-bold text-foreground mb-1">{getCategoryTitle()}</h1>
                          <p className="text-sm text-muted-foreground">
                            {debouncedSearchValue.trim()
                              ? // ? `${selectedCategory !== 'all' ? getCategoryTitle().split(' 검색')[0] + ' 카테고리에서 ' : ''}검색된 결과입니다`
                                `${selectedCategory !== 'all' ? getCategoryTitle().split(' 검색')[0] + ' ' : ''} 검색 결과입니다.`
                              : selectedCategory === 'weekly'
                                ? '조회수가 높은 인기 아티클을 확인하세요'
                                : selectedCategory === 'domestic'
                                  ? '한국 기업 및 개발자들의 기술 블로그'
                                  : selectedCategory === 'foreign'
                                    ? '해외 기술 블로그 및 미디어'
                                    : '모든 카테고리의 아티클을 한 곳에서'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <SelectBox
                          options={SELECT_OPTIONS.itemsPerPage}
                          value={itemsPerPage.toString()}
                          onChange={handleItemsPerPageChange}
                        />
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
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  새로운 데이터를 불러오는 중...
                </div>
              )}

              {/* 카드형 그리드 레이아웃 */}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${isPlaceholderData ? 'opacity-50' : ''}`}>
                {data?.articles && data.articles.length > 0 ? (
                  data.articles.map((article) => (
                    <Card
                      key={article.id}
                      className="group transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 overflow-hidden flex flex-col"
                      onClick={() => router.push(`/articles/${article.id}`)}>
                      {/* 썸네일 섹션 */}
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        {article.thumbnail ||
                        (article.thumbnail === '' && article.source_name === '우아한형제들 기술블로그') ? (
                          <Image
                            src={preprocessingThumbnail(article)}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                // 이미지 로드 실패 시 FallbackThumbnail로 교체
                                const fallbackDiv = document.createElement('div');
                                fallbackDiv.className = 'w-full h-full';
                                parent.innerHTML = '';
                                parent.appendChild(fallbackDiv);

                                // React 컴포넌트를 동적으로 렌더링하기 위해
                                // 여기서는 간단한 HTML로 대체
                                parent.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 flex items-center justify-center">
                                  <div class="text-white text-center">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2">
                                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                      <circle cx="9" cy="9" r="2"/>
                                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                    </svg>
                                    <div class="text-sm font-semibold">${article.source_name}</div>
                                  </div>
                                </div>
                              `;
                              }
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
                        <div className="absolute top-2 right-2 flex gap-1">
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
                                <MapPin className="w-3 h-3 mr-1" />
                                국내
                              </>
                            ) : (
                              <>
                                <Globe className="w-3 h-3 mr-1" />
                                해외
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      {/* 콘텐츠 섹션 */}
                      <CardContent className="p-4 flex-1">
                        <CardTitle className="text-sm font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight min-h-[2.1875rem]">
                          {article.title}
                        </CardTitle>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <span className="font-medium text-foreground truncate">{article.source_name}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{(article.view_count || 0).toLocaleString()}</span>
                          </div>
                          {article.comment_count !== undefined && article.comment_count > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>{article.comment_count.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                        </div>

                        <CardDescription className="text-xs mb-3 line-clamp-2 min-h-[2rem]">
                          {article.description}
                        </CardDescription>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(article.pub_date).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full">
                    <Card className="text-center py-12">
                      <CardContent>
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <Globe className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-muted-foreground mb-2">
                              {debouncedSearchValue.trim() ? '검색 결과가 없습니다' : '아티클이 없습니다'}
                            </p>
                            <p className="text-sm text-muted-foreground">
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
    </Suspense>
  );
}
