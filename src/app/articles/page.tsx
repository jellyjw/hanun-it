"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  Loader2,
  Menu,
  Eye,
} from "lucide-react";
import Pagination from "@/components/pagination/Pagination";
import PageInfo from "@/components/pagination/PageInfo";
import { Header } from "@/components/header/Header";
import { CategorySidebar } from "@/components/sidebar/CategorySidebar";
import { ArticlesResponse } from "@/types/articles";
import SelectBox from "@/components/select/SelectBox";
import { SELECT_OPTIONS } from "@/utils/options";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SearchInput from "@/components/SearchInput";
import { useSearch } from "@/hooks/useSearch";

export default function ArticlesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 검색 훅 사용
  const {
    searchValue,
    debouncedSearchValue,
    updateSearchValue,
    clearSearch,
    isSearching,
  } = useSearch("", 800);

  const { data, isLoading, error, refetch } = useQuery<ArticlesResponse>({
    queryKey: [
      "articles",
      selectedCategory,
      page,
      itemsPerPage,
      debouncedSearchValue,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      // 검색어가 있으면 searchValue 파라미터 추가
      if (debouncedSearchValue.trim()) {
        params.append("searchValue", debouncedSearchValue);
      }

      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
  });

  const handleRefreshRSS = async () => {
    try {
      const response = await fetch("/api/rss");
      const result = await response.json();
      if (result.success) {
        console.log(result, "result");
        alert(`${result.articles}개의 새로운 아티클을 수집했습니다.`);
        refetch();
      }
    } catch {
      alert("RSS 수집 중 오류가 발생했습니다.");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  // 검색 처리 함수
  const handleSearch = useCallback(
    (value: string) => {
      updateSearchValue(value);
      setPage(1); // 검색 시 첫 페이지로 이동
    },
    [updateSearchValue]
  );

  const getCategoryTitle = () => {
    if (debouncedSearchValue.trim()) {
      return `"${debouncedSearchValue}" 검색 결과`;
    }

    switch (selectedCategory) {
      case "domestic":
        return "국내 아티클";
      case "foreign":
        return "해외 아티클";
      case "weekly":
        return "주간 인기 아티클";
      default:
        return "전체 아티클";
    }
  };

  if (isLoading) {
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
                  <p className="text-muted-foreground">
                    아티클을 불러오는 중...
                  </p>
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
                    <CardTitle className="text-destructive">
                      오류가 발생했습니다
                    </CardTitle>
                    <CardDescription>
                      아티클을 불러올 수 없습니다.
                    </CardDescription>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                      >
                        <Menu className="w-4 h-4" />
                      </Button>
                      <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">
                          {getCategoryTitle()}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          {debouncedSearchValue.trim()
                            ? `${selectedCategory !== "all" ? getCategoryTitle().split(" 검색")[0] + " 카테고리에서 " : ""}검색된 결과입니다`
                            : selectedCategory === "weekly"
                              ? "조회수가 높은 인기 아티클을 확인하세요"
                              : selectedCategory === "domestic"
                                ? "한국 기업 및 개발자들의 기술 블로그"
                                : selectedCategory === "foreign"
                                  ? "해외 기술 블로그 및 미디어"
                                  : "모든 카테고리의 아티클을 한 곳에서"}
                        </p>
                      </div>
                    </div>
                    <SelectBox
                      options={SELECT_OPTIONS.itemsPerPage}
                      value={itemsPerPage.toString()}
                      onChange={(value) => {
                        setItemsPerPage(Number(value));
                        setPage(1);
                      }}
                    />
                  </div>

                  {/* 검색 입력 */}
                  <div className="w-full">
                    <SearchInput
                      onSearch={handleSearch}
                      isSearching={isSearching}
                      initialValue={searchValue}
                    />
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

            <div className="space-y-6">
              {data?.articles && data.articles.length > 0 ? (
                data.articles.map((article) => (
                  <Card
                    key={article.id}
                    className="group transition-all duration-300 cursor-pointer hover:shadow-lg"
                    onClick={() => router.push(`/articles/${article.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </CardTitle>
                        <Badge
                          variant={
                            article.is_domestic ? "default" : "secondary"
                          }
                          className={
                            article.is_domestic
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }
                        >
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
                    </CardHeader>

                    <CardContent className="pt-0">
                      <CardDescription className="text-sm mb-4 line-clamp-3 text-gray-600">
                        {article.description}
                      </CardDescription>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-foreground">
                            {article.source_name}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(article.pub_date).toLocaleDateString(
                                "ko-KR",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>
                              {(article.view_count || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <Globe className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-muted-foreground mb-2">
                          {debouncedSearchValue.trim()
                            ? "검색 결과가 없습니다"
                            : "아티클이 없습니다"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {debouncedSearchValue.trim()
                            ? "다른 검색어를 시도해보거나 카테고리를 변경해보세요"
                            : "다른 카테고리를 선택하거나 RSS를 새로고침해보세요"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex flex-col items-center space-y-6">
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
