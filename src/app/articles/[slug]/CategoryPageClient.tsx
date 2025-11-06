'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CategoryType } from '@/utils/constants';

interface CategoryPageClientProps {
  category: CategoryType;
}

export default function CategoryPageClient({ category }: CategoryPageClientProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /articles with category query param
    router.replace(`/articles?category=${category}`);
  }, [category, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-gray-600">카테고리 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
