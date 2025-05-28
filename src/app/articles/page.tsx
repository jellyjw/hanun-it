"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Calendar, ExternalLink, Globe, MapPin, Loader2 } from "lucide-react";
import Pagination from "@/components/pagination/Pagination";
import PageInfo from "@/components/pagination/PageInfo";
import { Header } from "@/components/header/Header";
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

export default function ArticlesPage() {
  const router = useRouter();
  const [isDomestic, setIsDomestic] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { data, isLoading, error, refetch } = useQuery<ArticlesResponse>({
    queryKey: ["articles", isDomestic, page, itemsPerPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      if (isDomestic !== null) params.append("domestic", isDomestic);

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

  const handleFilterChange = () => {
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header handleRefreshRSS={handleRefreshRSS} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">아티클을 불러오는 중...</p>
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
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-destructive">
                  오류가 발생했습니다
                </CardTitle>
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
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header handleRefreshRSS={handleRefreshRSS} />

      <div className="container mx-auto px-4 py-8">
        {/* 필터 및 설정 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <SelectBox
                options={SELECT_OPTIONS.isDomestic}
                value={isDomestic || ""}
                onChange={(value) => {
                  setIsDomestic(value || null);
                  handleFilterChange();
                }}
              />
              <SelectBox
                options={SELECT_OPTIONS.itemsPerPage}
                value={itemsPerPage.toString()}
                onChange={(value) => {
                  setItemsPerPage(Number(value));
                  setPage(1);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 페이지 정보 */}
        {data?.pagination && (
          <div className="mb-6">
            <PageInfo
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              totalItems={data.pagination.total}
              itemsPerPage={data.pagination.limit}
            />
          </div>
        )}

        {/* 아티클 목록 */}
        <div className="space-y-6 mb-8">
          {data?.articles && data.articles.length > 0 ? (
            data.articles.map((article) => (
              <Card
                key={article.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/20 hover:bg-accent/5"
                onClick={() => router.push(`/articles/${article.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <Badge
                      variant={article.is_domestic ? "default" : "secondary"}
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
                  <CardDescription className="text-base mb-4 line-clamp-3">
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
                      아티클이 없습니다
                    </p>
                    <p className="text-sm text-muted-foreground">
                      필터 조건을 변경하거나 RSS를 새로고침해보세요
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 페이지네이션 */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex flex-col items-center space-y-6">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={handlePageChange}
              showPageNumbers={7}
            />

            <PageInfo
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              totalItems={data.pagination.total}
              itemsPerPage={data.pagination.limit}
            />
          </div>
        )}
      </div>
    </div>
  );
}
