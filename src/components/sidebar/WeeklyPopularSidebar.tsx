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
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Award className="w-4 h-4 text-orange-600" />;
      default:
        return (
          <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
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
            className="text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            1위
          </Badge>
        );
      case 2:
        return (
          <Badge
            variant="secondary"
            className="text-xs font-bold bg-gradient-to-r from-gray-300 to-gray-400 text-white">
            2위
          </Badge>
        );
      case 3:
        return (
          <Badge
            variant="outline"
            className="text-xs font-bold bg-gradient-to-r from-orange-300 to-orange-400 text-white border-orange-400">
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
              <TrendingUp className="w-5 h-5 text-red-500" />
              <CardTitle className="text-base font-semibold">주간 인기 글</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
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
        <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-2">
            {/* <TrendingUp className="w-5 h-5 text-red-500" /> */}
            <CardTitle className="text-sm font-semibold text-gray-900">주간 인기 글 🔥</CardTitle>
          </div>
          <p className="text-xs text-gray-600 mt-1">이번 주 가장 많이 본 글들</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {popularArticles?.map((article, index) => {
              const rank = index + 1;
              return (
                <div
                  key={article.id}
                  className={`group cursor-pointer p-3 transition-all duration-200 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                    rank <= 3 ? 'bg-gradient-to-r from-yellow-50/30 to-orange-50/30' : ''
                  }`}
                  onClick={() => handleArticleClick(article.id)}>
                  <div className="flex items-start gap-3">
                    {/* 순위 아이콘 */}
                    <div className="flex-shrink-0 mt-1">{getRankIcon(rank)}</div>

                    {/* 아티클 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* 순위 배지 */}
                        <Badge
                          variant={rank === 1 ? 'hot' : rank <= 3 ? 'warning' : 'default-medium'}
                          size="sm"
                          showIcon={false}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                          {rank}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            article.is_domestic
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                          {article.is_domestic ? '국내' : '해외'}
                        </Badge>
                      </div>

                      <h4
                        className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-2"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                        {article.title}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <span
                            className="font-medium text-gray-700 max-w-[80px]"
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                            {article.source_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span className="font-medium">{(article.view_count || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
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
