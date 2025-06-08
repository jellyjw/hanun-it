'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Menu, Eye, Youtube, Calendar, ExternalLink } from 'lucide-react';
import Pagination from '@/components/pagination/Pagination';
import PageInfo from '@/components/pagination/PageInfo';
import { Header } from '@/components/header/Header';
import { CategorySidebar } from '@/components/sidebar/CategorySidebar';
import { YoutubeResponse } from '@/types/articles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SearchInput from '@/components/SearchInput';
import { useSearch } from '@/hooks/useSearch';
import FallbackThumbnail from '@/components/FallbackThumbnail';

export default function VideosPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 검색 훅 사용
  const { searchValue, debouncedSearchValue, updateSearchValue, isSearching } = useSearch('', 800);

  const { data, isLoading, error, refetch } = useQuery<YoutubeResponse>({
    queryKey: ['youtube', page, itemsPerPage, debouncedSearchValue],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      if (debouncedSearchValue.trim()) {
        params.append('searchValue', debouncedSearchValue);
      }

      const response = await fetch(`/api/youtube?${params}`);
      if (!response.ok) throw new Error('Failed to fetch videos');
      return response.json();
    },
  });

  const handleRefreshRSS = async () => {
    try {
      refetch();
      alert('YouTube 영상을 새로고침했습니다.');
    } catch {
      alert('YouTube 영상 새로고침 중 오류가 발생했습니다.');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    if (category === 'youtube') {
      // 이미 YouTube 페이지에 있음
      return;
    }
    // 다른 카테고리로 이동
    router.push('/articles');
  };

  const handleSearch = useCallback(
    (value: string) => {
      updateSearchValue(value);
      setPage(1);
    },
    [updateSearchValue],
  );

  const openVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:to-slate-800">
        <Header handleRefreshRSS={handleRefreshRSS} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <CategorySidebar
              selectedCategory="youtube"
              onCategoryChange={handleCategoryChange}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex-1">
              <div className="flex items-center justify-center min-h-[500px]">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-25"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                      YouTube 영상을 불러오는 중입니다
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">잠시만 기다려주세요...</p>
                  </div>
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:to-slate-800">
        <Header handleRefreshRSS={handleRefreshRSS} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <CategorySidebar
              selectedCategory="youtube"
              onCategoryChange={handleCategoryChange}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex-1">
              <div className="flex items-center justify-center min-h-[500px]">
                <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Youtube className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-800">문제가 발생했습니다</CardTitle>
                    <CardDescription className="text-slate-600">
                      YouTube 영상을 불러올 수 없습니다. API 키를 확인해주세요.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <Button
                      onClick={() => refetch()}
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
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
            selectedCategory="youtube"
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
                        <h1 className="text-2xl font-bold text-foreground mb-1">YouTube</h1>
                        <p className="text-sm text-muted-foreground">모든 카테고리의 유튜브 영상을 한 곳에서</p>
                      </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.videos && data.videos.length > 0 ? (
                data.videos.map((video, index) => (
                  <Card
                    key={video.id}
                    className="group transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 overflow-hidden flex flex-col"
                    onClick={() => openVideo(video.videoId)}>
                    {/* 썸네일 섹션 */}
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {video.thumbnail ? (
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
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
                                    <div class="text-sm font-semibold">${video.channelTitle}</div>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <FallbackThumbnail
                          title={video.title}
                          category={undefined}
                          sourceName={video.channelTitle}
                          isDomestic={false}
                        />
                      )}
                    </div>

                    {/* 콘텐츠 섹션 */}
                    <CardContent className="p-4 flex-1">
                      <CardTitle className="text-sm font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight min-h-[2.1875rem]">
                        {video.title}
                      </CardTitle>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span className="font-medium text-foreground truncate">{video.channelTitle}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{(video.viewCount || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      <CardDescription className="text-xs mb-3 line-clamp-2 min-h-[2rem]">
                        {video.description}
                      </CardDescription>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(video.publishedAt).toLocaleDateString('ko-KR', {
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
                          <Youtube className="w-8 h-8 text-muted-foreground" />
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
              {/* {data?.videos && data.videos.length > 0 ? (
                data.videos.map((video, index) => (
                  <Card
                    key={video.id}
                    className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white/90"
                    onClick={() => openVideo(video.videoId)}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                        {video.duration}
                      </div>
                    </div>

                    <CardHeader className="pb-3 relative z-10">
                      <CardTitle className="text-base font-bold group-hover:text-red-600 transition-colors duration-300 line-clamp-2 leading-tight">
                        {video.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Youtube className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                          {video.channelTitle}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 relative z-10">
                      <CardDescription className="text-sm mb-4 line-clamp-2 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {video.description}
                      </CardDescription>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1.5 text-slate-500">
                            <Eye className="w-4 h-4" />
                            <span className="font-medium">{video.viewCount.toLocaleString()}</span>
                          </div>
                          {(video.likeCount ?? 0) > 0 && (
                            <div className="flex items-center space-x-1.5 text-slate-500">
                              <ThumbsUp className="w-4 h-4" />
                              <span className="font-medium">{(video.likeCount ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                          {(video.commentCount ?? 0) > 0 && (
                            <div className="flex items-center space-x-1.5 text-slate-500">
                              <MessageCircle className="w-4 h-4" />
                              <span className="font-medium">{(video.commentCount ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">
                            {new Date(video.publishedAt).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="text-center py-16">
                      <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-r from-red-200 to-orange-200 rounded-2xl flex items-center justify-center">
                            <Youtube className="w-10 h-10 text-red-500" />
                          </div>
                          <div className="absolute -inset-1 bg-gradient-to-r from-red-200 to-orange-200 rounded-2xl blur opacity-25"></div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                            {debouncedSearchValue.trim() ? '검색 결과가 없습니다' : '영상을 불러올 수 없습니다'}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 max-w-md">
                            {debouncedSearchValue.trim()
                              ? '다른 검색어를 시도해보세요'
                              : 'YouTube API 설정을 확인하거나 잠시 후 다시 시도해주세요'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )} */}
            </div>

            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex flex-col items-center space-y-8 pt-4">
                <Pagination
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
