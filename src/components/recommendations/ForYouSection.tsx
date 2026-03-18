'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRecommendations } from '@/hooks/useRecommendations';
import FallbackThumbnail from '@/components/FallbackThumbnail';

export const ForYouSection = React.memo(function ForYouSection() {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading } = useRecommendations(6);
  const router = useRouter();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = useCallback((id: string) => {
    setFailedImages((prev) => new Set(prev).add(id));
  }, []);

  // 비로그인 또는 로딩 중이면 표시하지 않음
  if (authLoading || !user) {
    return null;
  }

  // 데이터 로딩 중 스켈레톤
  if (isLoading) {
    return (
      <div className="mb-8 sm:mb-12">
        <div className="mb-4 flex items-center gap-2 sm:mb-6">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">맞춤 추천</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-lg bg-gray-50">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-3">
                <div className="mb-2 h-3 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 추천 결과 없으면 표시하지 않음
  if (!data?.articles || data.articles.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 sm:mb-12">
      <div className="mb-4 flex items-center gap-2 sm:mb-6">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">맞춤 추천</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {data.articles.map((article) => (
          <div
            key={article.id}
            className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            onClick={() => router.push(`/articles/${article.id}`)}>
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
              {article.thumbnail && !failedImages.has(article.id) ? (
                <Image
                  src={article.thumbnail}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  loading="lazy"
                  onError={() => handleImageError(article.id)}
                />
              ) : (
                <FallbackThumbnail
                  title={article.title}
                  category={undefined}
                  sourceName={article.source_name}
                  isDomestic={article.is_domestic}
                />
              )}
            </div>
            <div className="p-2 sm:p-3">
              <h3 className="mb-1 line-clamp-2 text-xs font-semibold text-gray-900 sm:text-sm">
                {article.title}
              </h3>
              <p className="text-[10px] text-gray-500 sm:text-xs">{article.source_name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
