"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, ExternalLink, Eye } from "lucide-react";
import { ArticleResponse } from "@/types/articles";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params?.id as string;

  const { data, isLoading, error } = useQuery<ArticleResponse>({
    queryKey: ["article", articleId],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${articleId}`);
      if (!response.ok) throw new Error("Failed to fetch article");
      return response.json();
    },
  });

  // 조회수 증가 뮤테이션
  const incrementViewMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/articles/${id}/view`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to increment view count");
      return response.json();
    },
  });

  // 컴포넌트 마운트 시 조회수 증가
  useEffect(() => {
    if (articleId && data?.success) {
      incrementViewMutation.mutate(articleId);
    }
  }, [articleId, data?.success]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            오류가 발생했습니다
          </h1>
          <p className="text-gray-600 mb-4">아티클을 불러올 수 없습니다.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const article = data.article;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          목록으로 돌아가기
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-2 py-1 text-xs rounded ${
              article.is_domestic
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {article.is_domestic ? "국내" : "해외"}
          </span>
          <span className="text-sm text-gray-500">{article.source_name}</span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">
            {new Date(article.pub_date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {article.view_count !== undefined && (
            <>
              <span className="text-sm text-gray-500">•</span>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Eye size={14} />
                <span>{article.view_count.toLocaleString()}회</span>
              </div>
            </>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        {/* 원문 링크 */}
        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">원문 출처</p>
              <p className="font-medium text-gray-900">{article.source_name}</p>
            </div>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              <ExternalLink size={16} />
              원문 보기
            </a>
          </div>
        </div>
      </div>

      {/* 아티클 내용 */}
      <div className="prose prose-lg prose-gray max-w-none dark:prose-invert">
        {article.content ? (
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <div className="text-gray-800 leading-relaxed">
            <p className="mb-4">{article.description}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                이 아티클의 전체 내용을 확인하시려면{" "}
                <a
                  href={article.link}
                  className="text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  원문 링크
                </a>
                를 클릭해주세요.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 하단 액션 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 목록으로 돌아가기
          </button>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            원문에서 계속 읽기
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
