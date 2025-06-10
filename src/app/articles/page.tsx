'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, keepPreviousData, QueryFunctionContext } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, ExternalLink, Globe, MapPin, Loader2, Menu, Eye } from 'lucide-react';
import PageInfo from '@/components/pagination/PageInfo';
import { Header } from '@/components/header/Header';
import { CategorySidebar } from '@/components/sidebar/CategorySidebar';
import { ArticlesResponse } from '@/types/articles';
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

export default function ArticlesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  // URL 파라미터에서 초기값 설정
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get('category') || 'domestic';
  });
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    return parseInt(searchParams.get('limit') || '20');
  });
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(searchParams.get('page') || '1');
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 검색 훅 사용 - 초기값을 URL에서 가져옴
  const { searchValue, debouncedSearchValue, updateSearchValue, isSearching } = useSearch(
    searchParams.get('search') || '',
    800,
  );

  // URL 업데이트 함수
  const updateURL = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams);

      Object.entries(params).forEach(([key, value]) => {
        if (
          value === null ||
          value === '' ||
          (key === 'category' && value === 'all') ||
          (key === 'page' && value === 1)
        ) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });

      const newURL = `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
      router.replace(newURL, { scroll: false });
    },
    [searchParams, router],
  );

  // URL과 상태 동기화
  useEffect(() => {
    toast({
      title: 'URL 업데이트',
      description: 'URL이 업데이트되었습니다.',
      variant: 'success',
    });
    updateURL({
      page: currentPage,
      category: selectedCategory,
      limit: itemsPerPage,
      search: debouncedSearchValue,
    });
  }, [currentPage, selectedCategory, itemsPerPage, debouncedSearchValue, updateURL]);

  // TanStack Query 페이지네이션을 위한 쿼리 함수
  const fetchArticles = useCallback(
    async (context: QueryFunctionContext<readonly [string, number, string, number, string]>) => {
      const [, page, category, limit, searchValue] = context.queryKey;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (category !== 'all') {
        params.append('category', category);
      }

      if (searchValue.trim()) {
        params.append('searchValue', searchValue);
      }

      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json() as Promise<ArticlesResponse>;
    },
    [],
  );

  // TanStack Query를 사용한 페이지네이션
  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery({
    queryKey: ['articles', currentPage, selectedCategory, itemsPerPage, debouncedSearchValue] as const,
    queryFn: fetchArticles,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });

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

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // 검색 처리 함수
  const handleSearch = useCallback(
    (value: string) => {
      updateSearchValue(value);
      setCurrentPage(1);
    },
    [updateSearchValue],
  );

  // 페이지당 아이템 수 변경 처리
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = Number(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getCategoryTitle = () => {
    if (debouncedSearchValue.trim()) {
      return `"${debouncedSearchValue}" 검색 결과`;
    }

    switch (selectedCategory) {
      case 'domestic':
        return '국내 아티클';
      case 'foreign':
        return '해외 아티클';
      case 'weekly':
        return '주간 인기 아티클';
      default:
        return '전체 아티클';
    }
  };

  if (isLoading && !isPlaceholderData) {
    return (
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
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
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
                      <Button variant="outline" size="sm" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="w-4 h-4" />
                      </Button>
                      <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">{getCategoryTitle()}</h1>
                        <p className="text-sm text-muted-foreground">
                          {debouncedSearchValue.trim()
                            ? `${selectedCategory !== 'all' ? getCategoryTitle().split(' 검색')[0] + ' 카테고리에서 ' : ''}검색된 결과입니다`
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
                      {article.thumbnail ? (
                        <Image
                          src={article.thumbnail}
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

                      {/* 국내/해외 배지 */}
                      <Badge
                        className={`absolute top-2 right-2 ${
                          article.is_domestic ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                        } text-white border-0`}>
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
                  initialPage={currentPage}
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
