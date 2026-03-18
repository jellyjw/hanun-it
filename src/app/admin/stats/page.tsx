'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StatsData {
  bySource: { source_name: string; count: number }[];
  byCategory: { category: string; count: number }[];
  byDate: { date: string; count: number }[];
  commentCount: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  tech: 'Tech',
  news: 'News',
  ai: 'AI',
  data: 'Data',
  community: 'Community',
  personal: 'Personal',
};

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchStats();
  }, [days]);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?days=${days}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  const maxSourceCount = Math.max(...stats.bySource.map((s) => s.count), 1);
  const maxCategoryCount = Math.max(...stats.byCategory.map((c) => c.count), 1);
  const maxDateCount = Math.max(...stats.byDate.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">통계</h1>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((d) => (
            <Button key={d} variant={days === d ? 'default' : 'outline'} size="sm" onClick={() => setDays(d)}>
              {d}일
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">기간 내 댓글 수</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{stats.commentCount.toLocaleString()}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">소스별 아티클 수</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.bySource.slice(0, 15).map((item) => (
              <div key={item.source_name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate">{item.source_name}</span>
                  <span className="shrink-0 text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(item.count / maxSourceCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">카테고리별 아티클 수</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.byCategory.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{CATEGORY_LABELS[item.category] || item.category}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${(item.count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">일별 아티클 수집 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1" style={{ height: 200 }}>
            {stats.byDate.map((item) => (
              <div key={item.date} className="group relative flex flex-1 flex-col items-center justify-end">
                <div
                  className="w-full min-w-[4px] rounded-t bg-primary/80 transition-all group-hover:bg-primary"
                  style={{ height: `${(item.count / maxDateCount) * 100}%`, minHeight: item.count > 0 ? 4 : 0 }}
                />
                <div className="absolute -top-8 hidden rounded bg-foreground px-2 py-1 text-xs text-background group-hover:block">
                  {item.date}: {item.count}
                </div>
              </div>
            ))}
          </div>
          {stats.byDate.length > 0 && (
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{stats.byDate[0]?.date}</span>
              <span>{stats.byDate[stats.byDate.length - 1]?.date}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
