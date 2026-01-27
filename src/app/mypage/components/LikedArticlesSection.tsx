'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import ArticleCard from './ArticleCard';
import { LikedArticlesResponse } from '@/types/user';

export default function LikedArticlesSection() {
  const { data, isLoading, error } = useQuery<LikedArticlesResponse>({
    queryKey: ['mypage', 'likes'],
    queryFn: async () => {
      const response = await fetch('/api/users/me/likes?limit=3');
      if (!response.ok) throw new Error('좋아요 목록을 불러올 수 없습니다.');
      return response.json();
    },
    staleTime: 1000 * 60,
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">좋아요 한 글</h3>
          {data && data.pagination?.total > 3 && (
            <Link
              href="/mypage/likes"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              전체보기
            </Link>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex animate-pulse gap-3 rounded-lg border p-3">
                  <div className="h-16 w-16 shrink-0 rounded bg-gray-100 sm:h-[72px] sm:w-[72px]" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="h-3.5 w-3/4 rounded bg-gray-100" />
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              불러오지 못했습니다.
            </p>
          ) : !data?.articles || data.articles.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              아직 좋아요 한 글이 없습니다.
            </p>
          ) : (
            data.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
