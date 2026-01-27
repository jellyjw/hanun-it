'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ArticleCard from '../components/ArticleCard';
import { ViewedArticlesResponse } from '@/types/user';

export default function ViewedArticlesPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery<ViewedArticlesResponse>({
    queryKey: ['mypage', 'views', 'all', page],
    queryFn: async () => {
      const response = await fetch(`/api/users/me/views?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('읽은 글 목록을 불러올 수 없습니다.');
      return response.json();
    },
    staleTime: 1000 * 60,
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <div className="mb-6">
          <Link
            href="/mypage"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; 마이페이지
          </Link>
          <h1 className="mt-2 text-xl font-bold">읽은 글</h1>
          {data?.pagination && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {data.pagination.total}개
            </p>
          )}
        </div>

        <div className="space-y-1">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex animate-pulse gap-3 p-3">
                <div className="h-16 w-16 shrink-0 rounded bg-gray-100 sm:h-[72px] sm:w-[72px]" />
                <div className="flex-1 space-y-2 py-0.5">
                  <div className="h-3.5 w-3/4 rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </div>
              </div>
            ))
          ) : !data?.articles || data.articles.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              읽은 글이 없습니다.
            </p>
          ) : (
            data.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </div>

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!data.pagination.hasPrev}
            >
              이전
            </Button>
            <span className="text-xs text-muted-foreground">
              {data.pagination.page} / {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.pagination.hasNext}
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
