'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Globe, MapPin, TrendingUp, FileText, X, Youtube, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CategorySidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface CategoryStats {
  domestic: number;
  foreign: number;
  total: number;
  weekly: number;
}

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  count?: number;
  type?: 'article' | 'video';
  badgeText?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function CategorySidebar({ selectedCategory, onCategoryChange, isOpen = true, onClose }: CategorySidebarProps) {
  const router = useRouter();

  const { data: stats } = useQuery<CategoryStats>({
    queryKey: ['category-stats'],
    queryFn: async () => {
      const response = await fetch('/api/articles/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const articleCategories = [
    // {
    //   id: 'all',
    //   label: '전체 아티클',
    //   icon: FileText,
    //   count: stats?.total || 0,
    //   description: '',
    //   type: 'article' as const,
    //   badgeText: 'All',
    //   badgeVariant: 'secondary' as const,
    // },
    {
      id: 'domestic',
      label: '국내 아티클',
      icon: MapPin,
      count: stats?.domestic || 0,
      description: '국내 기술 블로그 및 미디어',
      type: 'article' as const,
      badgeText: 'KR',
      badgeVariant: 'default' as const,
    },
    {
      id: 'foreign',
      label: '해외 아티클',
      icon: Globe,
      count: stats?.foreign || 0,
      description: '해외 기술 블로그 및 미디어',
      type: 'article' as const,
      badgeText: 'Global',
      badgeVariant: 'outline' as const,
    },
    {
      id: 'weekly',
      label: '주간 인기',
      icon: TrendingUp,
      count: stats?.weekly || 0,
      description: '조회수 기준 인기 아티클',
      type: 'article' as const,
      badgeText: 'Hot',
      badgeVariant: 'destructive' as const,
    },
  ];

  const otherCategories = [
    {
      id: 'youtube',
      label: 'YouTube',
      icon: Youtube,
      description: 'IT 관련 YouTube',
      type: 'video' as const,
      badgeText: 'Video',
      badgeVariant: 'destructive' as const,
    },
  ];

  const handleCategoryClick = (categoryId: string, type?: string) => {
    if (type === 'video') {
      router.push('/videos');
    } else {
      onCategoryChange(categoryId);
    }

    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  const CategoryCard = ({ category, isSelected = false }: { category: Category; isSelected?: boolean }) => {
    const Icon = category.icon;

    return (
      <Card
        className={`group cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-[2px] overflow-hidden border ${
          isSelected
            ? 'bg-gray-50 border-gray-300 shadow-sm'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
        }`}
        onClick={() => handleCategoryClick(category.id, category.type)}>
        <CardContent className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isSelected
                    ? 'bg-blue-100 border border-blue-200'
                    : 'bg-gray-100 group-hover:bg-blue-50 border border-gray-200 group-hover:border-blue-200'
                }`}>
                <Icon
                  className={`w-4 h-4 transition-colors duration-300 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-500'
                  }`}
                />
              </div>
              <div className="flex flex-col">
                <h3
                  className={`font-medium text-sm transition-colors duration-300 ${
                    isSelected ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                  {category.label}
                </h3>
                <span className="text-xs text-gray-500">{category.description}</span>
              </div>
            </div>
            {/* <div className="flex items-center gap-2">
              {category.count !== undefined && (
                <Badge
                  variant="outline"
                  className={`text-xs font-medium transition-colors duration-300 ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-gray-50 text-gray-600 border-gray-300 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200"
                  }`}
                >
                  {category.count}
                </Badge>
              )}
            </div> */}
          </div>
        </CardContent>
      </Card>
    );
  };

  const CategorySection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-2">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && onClose && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      {/* 사이드바 */}
      <div
        className={`
        fixed flex flex-col gap-6 md:static top-0 left-0 h-full md:h-auto w-64 bg-white z-50 md:z-auto
        transform transition-transform duration-300 ease-in-out md:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        p-4 overflow-y-auto border-r border-gray-200
      `}>
        {/* 모바일 닫기 버튼 */}
        {onClose && (
          <div className="flex justify-end md:hidden mb-4">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* 아티클 카테고리 */}
        <CategorySection title="Articles">
          {articleCategories.map((category) => (
            <CategoryCard key={category.id} category={category} isSelected={selectedCategory === category.id} />
          ))}
        </CategorySection>

        {/* 기타 카테고리 */}
        <CategorySection title="ETC">
          {otherCategories.map((category) => (
            <CategoryCard key={category.id} category={category} isSelected={selectedCategory === category.id} />
          ))}
        </CategorySection>
      </div>
    </>
  );
}
