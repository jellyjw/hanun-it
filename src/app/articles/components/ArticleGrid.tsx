'use client';

import { ArticleCard } from '@/components/articles/ArticleCard';
import { ArticleCardData } from '@/types/articles';

interface ArticleGridProps {
  articles: ArticleCardData[];
  selectedCategory: string;
  searchValue: string;
  failedImages: Set<string>;
  onImageError: (articleId: string) => void;
}

function EmptyState({ selectedCategory, searchValue }: { selectedCategory: string; searchValue: string }) {
  const title = selectedCategory === 'videos' ? '영상을 불러올 수 없습니다' : '아티클이 없습니다';
  const description =
    selectedCategory === 'videos'
      ? 'YouTube 영상 조회 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.'
      : searchValue.trim()
        ? '다른 검색어를 시도해보세요'
        : '선택한 카테고리에 아직 등록된 아티클이 없습니다.\n곧 새로운 콘텐츠가 추가될 예정입니다.';

  return (
    <div className="col-span-full">
      <div className="rounded-lg bg-gray-50 py-24 text-center sm:py-32">
        <div className="mx-auto max-w-md px-4">
          <div className="mb-4 text-6xl">📭</div>
          <h3 className="mb-3 text-xl font-semibold text-gray-900 sm:text-2xl">{title}</h3>
          <p className="whitespace-pre-wrap text-sm text-gray-600 sm:text-base">{description}</p>
        </div>
      </div>
    </div>
  );
}

/** 아티클/영상 카드 그리드. 데이터가 없으면 빈 상태를 보여준다. */
export function ArticleGrid({ articles, selectedCategory, searchValue, failedImages, onImageError }: ArticleGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
      {articles.length > 0 ? (
        articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            selectedCategory={selectedCategory}
            failedImages={failedImages}
            onImageError={onImageError}
          />
        ))
      ) : (
        <EmptyState selectedCategory={selectedCategory} searchValue={searchValue} />
      )}
    </div>
  );
}
