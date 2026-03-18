'use client';

import React from 'react';
import Image from 'next/image';
import { Eye, Play } from 'lucide-react';
import FallbackThumbnail from '@/components/FallbackThumbnail';
import { Article } from '@/types/articles';

type ArticleWithExtras = Omit<Article, 'category'> & {
  category: string;
  videoId?: string;
  duration?: string;
};

interface ArticleCardProps {
  article: ArticleWithExtras;
  selectedCategory: string;
  failedImages: Set<string>;
  onImageError: (articleId: string) => void;
  onClick: (article: ArticleWithExtras) => void;
}

function preprocessThumbnail(article: Pick<ArticleWithExtras, 'thumbnail' | 'source_name' | 'category'>): string {
  let thumbnail = article.thumbnail;

  if (thumbnail.includes('https://techblog.woowa.in')) {
    thumbnail = thumbnail.replace('https://techblog.woowa.in', 'https://techblog.woowahan.com');
  } else if (thumbnail === '' && article.source_name === '우아한형제들 기술블로그') {
    return 'https://techblog.woowahan.com/wp-content/uploads/2023/02/2023-%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC-%EB%A1%9C%EA%B3%A0-2-e1675772695839.png';
  }

  if ((article.category as string) === 'videos' && thumbnail.includes('i.ytimg.com')) {
    thumbnail = thumbnail
      .replace(/maxresdefault\.jpg/g, 'mqdefault.jpg')
      .replace(/hqdefault\.jpg/g, 'mqdefault.jpg')
      .replace(/sddefault\.jpg/g, 'mqdefault.jpg')
      .replace(/hq720\.jpg/g, 'mqdefault.jpg')
      .replace(/maxresdefault\.webp/g, 'mqdefault.jpg')
      .replace(/hqdefault\.webp/g, 'mqdefault.jpg')
      .replace(/sddefault\.webp/g, 'mqdefault.jpg');

    if (!thumbnail.includes('mqdefault') && thumbnail.includes('i.ytimg.com')) {
      const videoIdMatch = thumbnail.match(/vi\/([^\/]+)\//);
      if (videoIdMatch) {
        thumbnail = `https://i.ytimg.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
      }
    }
  }

  return thumbnail;
}

export const ArticleCard = React.memo(function ArticleCard({
  article,
  selectedCategory,
  failedImages,
  onImageError,
  onClick,
}: ArticleCardProps) {
  return (
    <div
      className="group flex h-auto min-h-0 w-full cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(article);
      }}>
      {/* 썸네일 */}
      <div
        className={`relative aspect-video w-full overflow-hidden bg-gray-100 ${
          article.category === 'videos' ? 'sm:aspect-video' : 'sm:aspect-[4/3]'
        }`}>
        {(article.thumbnail ||
          (article.thumbnail === '' && article.source_name === '우아한형제들 기술블로그')) &&
        !failedImages.has(article.id) ? (
          <Image
            src={preprocessThumbnail(article)}
            alt={article.title}
            fill
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            priority={false}
            style={{ objectFit: 'cover' }}
            onError={() => onImageError(article.id)}
          />
        ) : (
          <FallbackThumbnail
            title={article.title}
            category={undefined}
            sourceName={article.source_name}
            isDomestic={article.is_domestic}
          />
        )}

        {article.category === 'videos' && (
          <>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 shadow-lg">
                <Play className="ml-0.5 h-6 w-6 text-white" fill="currentColor" />
              </div>
            </div>
            {article.duration && (
              <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
                {article.duration}
              </div>
            )}
          </>
        )}
      </div>

      {/* 컨텐츠 */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between">
          <span
            className={`text-xs font-medium ${
              article.category === 'videos' ? 'text-red-600' : 'text-emerald-600'
            }`}>
            {article.source_name}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(article.pub_date).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">
          {article.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-xs text-gray-600 sm:text-sm">{article.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <button
            className={`rounded-full px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:shadow-md sm:px-4 sm:py-2 sm:text-sm ${
              article.category === 'videos'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}>
            {article.category === 'videos' ? 'Watch Video' : 'Read More'}
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-500 sm:gap-3 sm:text-sm">
            {article.category === 'videos' && article.view_count ? (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{article.view_count.toLocaleString()}</span>
              </div>
            ) : (article.like_count || 0) > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-xs">&#10084;&#65039;</span>
                <span>{article.like_count}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});
