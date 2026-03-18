'use client';

import React from 'react';

interface CategoryTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = [
  { key: 'domestic', label: '국내' },
  { key: 'foreign', label: '해외' },
  { key: 'news', label: 'News' },
  { key: 'ai-data', label: 'AI/Data' },
  { key: 'personal', label: 'Personal' },
  { key: 'videos', label: '인기 영상' },
] as const;

export const CategoryTabs = React.memo(function CategoryTabs({
  selectedCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="mt-4 overflow-x-auto">
      <div className="flex gap-2">
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === key
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
});
