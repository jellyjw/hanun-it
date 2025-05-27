"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Pagination from "@/components/pagination/Pagination";
import PageInfo from "@/components/pagination/PageInfo";

interface Article {
  id: string;
  title: string;
  description: string;
  link: string;
  pub_date: string;
  source_name: string;
  category: string;
  is_domestic: boolean;
}

interface ArticlesResponse {
  success: boolean;
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function ArticlesPage() {
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [isDomestic, setIsDomestic] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { data, isLoading, error, refetch } = useQuery<ArticlesResponse>({
    queryKey: ["articles", category, isDomestic, page, itemsPerPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      if (category !== "all") params.append("category", category);
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
        alert(`${result.articles}개의 새로운 아티클을 수집했습니다.`);
        refetch();
      }
    } catch (error) {
      alert("RSS 수집 중 오류가 발생했습니다.");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = () => {
    // 필터 변경 시 첫 페이지로 리셋
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            오류가 발생했습니다
          </h1>
          <p className="text-gray-600 mb-4">아티클을 불러올 수 없습니다.</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">테크 아티클</h1>
        <button
          onClick={handleRefreshRSS}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          RSS 새로고침
        </button>
      </div>

      {/* 필터 및 설정 */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            handleFilterChange();
          }}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">모든 카테고리</option>
          <option value="tech">기술</option>
          <option value="news">뉴스</option>
        </select>

        <select
          value={isDomestic || ""}
          onChange={(e) => {
            setIsDomestic(e.target.value || null);
            handleFilterChange();
          }}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">국내/해외 전체</option>
          <option value="true">국내</option>
          <option value="false">해외</option>
        </select>

        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setPage(1);
          }}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={10}>10개씩 보기</option>
          <option value={20}>20개씩 보기</option>
          <option value={50}>50개씩 보기</option>
          <option value={100}>100개씩 보기</option>
        </select>
      </div>

      {/* 페이지 정보 */}
      {data?.pagination && (
        <div className="mb-4">
          <PageInfo
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            totalItems={data.pagination.total}
            itemsPerPage={data.pagination.limit}
          />
        </div>
      )}

      {/* 아티클 목록 */}
      <div className="space-y-4 mb-8">
        {data?.articles && data.articles.length > 0 ? (
          data.articles.map((article) => (
            <div
              key={article.id}
              className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-all duration-200 hover:border-blue-300"
              onClick={() => router.push(`/articles/${article.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold hover:text-blue-600 transition-colors">
                  {article.title}
                </h2>
                <span
                  className={`px-2 py-1 text-xs rounded flex-shrink-0 ml-2 ${
                    article.is_domestic
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {article.is_domestic ? "국내" : "해외"}
                </span>
              </div>

              <p className="text-gray-600 mb-2 line-clamp-2">
                {article.description}
              </p>

              <div className="flex justify-between text-sm text-gray-500">
                <span className="font-medium">{article.source_name}</span>
                <span>
                  {new Date(article.pub_date).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">아티클이 없습니다.</p>
            <p className="text-gray-400 text-sm mt-2">
              필터 조건을 변경하거나 RSS를 새로고침해보세요.
            </p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex flex-col items-center space-y-4">
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
            showPageNumbers={7}
          />

          {/* 하단 페이지 정보 */}
          <PageInfo
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            totalItems={data.pagination.total}
            itemsPerPage={data.pagination.limit}
          />
        </div>
      )}
    </div>
  );
}
