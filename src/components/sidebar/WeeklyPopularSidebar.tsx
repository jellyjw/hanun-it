'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { TrendingUp, Eye, Calendar, Medal, Crown, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Article } from '@/types/articles';

interface WeeklyPopularSidebarProps {
  className?: string;
}

export function WeeklyPopularSidebar({ className }: WeeklyPopularSidebarProps) {
  const router = useRouter();

  const { data: popularArticles, isLoading } = useQuery<Article[]>({
    queryKey: ['weekly-popular-articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles?category=weekly&limit=10');
      if (!response.ok) throw new Error('Failed to fetch popular articles');
      const data = await response.json();
      return data.articles || [];
    },
  });

  const handleArticleClick = (articleId: string) => {
    router.push(`/articles/${articleId}`);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-orange-600" />;
      default:
        return (
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200">
            <span className="text-xs font-bold text-gray-600">{rank}</span>
          </div>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Badge
            variant="destructive"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-xs font-bold text-white"
          >
            1위
          </Badge>
        );
      case 2:
        return (
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-gray-300 to-gray-400 text-xs font-bold text-white"
          >
            2위
          </Badge>
        );
      case 3:
        return (
          <Badge
            variant="outline"
            className="border-orange-400 bg-gradient-to-r from-orange-300 to-orange-400 text-xs font-bold text-white"
          >
            3위
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs font-medium">
            {rank}위
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className={`w-64 ${className}`}>
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              <CardTitle className="text-base font-semibold">주간 인기 글</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-4 rounded bg-gray-200"></div>
                <div className="h-3 rounded bg-gray-200"></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-64 ${className}`}>
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 pb-3">
          <div className="flex items-center gap-2">
            {/* <TrendingUp className="w-5 h-5 text-red-500" /> */}
            <CardTitle className="text-sm font-semibold text-gray-900">주간 인기 글 🔥</CardTitle>
          </div>
          <p className="mt-1 text-xs text-gray-600">이번 주 가장 많이 본 글들</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {popularArticles?.map((article, index) => {
              const rank = index + 1;
              return (
                <div
                  key={article.id}
                  className={`group cursor-pointer border-b border-gray-100 p-3 transition-all duration-200 last:border-b-0 hover:bg-gray-50 ${
                    rank <= 3 ? 'bg-gradient-to-r from-yellow-50/30 to-orange-50/30' : ''
                  }`}
                  onClick={() => handleArticleClick(article.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* 순위 아이콘 */}
                    <div className="mt-1 flex-shrink-0">{getRankIcon(rank)}</div>

                    {/* 아티클 정보 */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        {/* 순위 배지 */}
                        <Badge
                          variant={rank === 1 ? 'hot' : rank <= 3 ? 'warning' : 'default-medium'}
                          size="sm"
                          showIcon={false}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                        >
                          {rank}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            article.is_domestic
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-blue-200 bg-blue-50 text-blue-700'
                          }`}
                        >
                          {article.is_domestic ? '국내' : '해외'}
                        </Badge>
                      </div>

                      <h4
                        className="mb-2 text-sm font-medium leading-tight text-gray-900 transition-colors group-hover:text-blue-600"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {article.title}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <span
                            className="max-w-[80px] font-medium text-gray-700"
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {article.source_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span className="font-medium">{(article.view_count || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(article.pub_date).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
