'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Heart } from 'lucide-react';
import dayjs from 'dayjs';
import { Badge } from '@/components/ui/badge';
import { useGetPopularArticles } from '@/hooks/useGetPopularArticles';

interface WeeklyPopularSidebarProps {
  className?: string;
}

export const WeeklyPopularSidebar = React.memo(function WeeklyPopularSidebar({ className }: WeeklyPopularSidebarProps) {
  const router = useRouter();
  const { data: popularData, isLoading } = useGetPopularArticles();

  const formatUpdatedAt = (dateString: string) => dayjs(dateString).format('YYYY.MM.DD HH시 기준');

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 sm:text-lg">주간 인기 아티클</h3>
            <Badge
              variant="secondary"
              className="h-5 rounded bg-gradient-to-r from-blue-500 to-indigo-500 px-1.5 text-[10px] font-bold text-white shadow-sm hover:from-blue-600 hover:to-indigo-600"
              showIcon={false}>
              NEW
            </Badge>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg bg-gray-50 p-3 sm:p-4">
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!popularData?.articles || popularData.articles.length === 0) {
    return (
      <div className={className}>
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base font-semibold text-gray-900 sm:text-lg">주간 인기 아티클</h3>
          <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
            최근 일주일간 인기 아티클이 없습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3 sm:space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 sm:text-lg">주간 인기 아티클</h3>
            <Badge
              variant="secondary"
              className="h-5 rounded bg-gradient-to-r from-blue-500 to-indigo-500 px-1.5 text-[10px] font-bold text-white shadow-sm hover:from-blue-600 hover:to-indigo-600"
              showIcon={false}>
              NEW
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500">{formatUpdatedAt(popularData.updatedAt)}</p>
        </div>

        {popularData.articles.map((article) => (
          <div
            key={article.id}
            className="cursor-pointer rounded-lg bg-gray-50 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-md sm:p-4"
            onClick={() => router.push(`/articles/${article.id}`)}>
            <h4 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900 sm:text-base">{article.title}</h4>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600 sm:text-sm">{article.source_name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {article.view_count && article.view_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{article.view_count}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{article.like_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
