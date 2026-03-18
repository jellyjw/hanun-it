import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function getDashboardStats() {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [articlesRes, usersRes, todayArticlesRes, subscribersRes] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('newsletter_subscriptions').select('id', { count: 'exact', head: true }),
    supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .gte('pub_date', today.toISOString()),
    supabase
      .from('newsletter_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
  ]);

  const { data: recentArticles } = await supabase
    .from('articles')
    .select('id, title, source_name, pub_date, view_count')
    .order('pub_date', { ascending: false })
    .limit(10);

  const { data: topArticles } = await supabase
    .from('articles')
    .select('id, title, source_name, view_count')
    .order('view_count', { ascending: false })
    .limit(5);

  return {
    totalArticles: articlesRes.count ?? 0,
    totalUsers: usersRes.count ?? 0,
    todayArticles: todayArticlesRes.count ?? 0,
    activeSubscribers: subscribersRes.count ?? 0,
    recentArticles: recentArticles ?? [],
    topArticles: topArticles ?? [],
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: '전체 아티클', value: stats.totalArticles.toLocaleString(), color: 'text-blue-600' },
    { label: '오늘 수집', value: stats.todayArticles.toLocaleString(), color: 'text-green-600' },
    { label: '뉴스레터 구독자', value: stats.totalUsers.toLocaleString(), color: 'text-purple-600' },
    { label: '활성 구독자', value: stats.activeSubscribers.toLocaleString(), color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 수집된 아티클</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentArticles.map((article) => (
                <div key={article.id} className="flex items-start justify-between gap-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {article.source_name} &middot; {new Date(article.pub_date).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {article.view_count?.toLocaleString() ?? 0}회
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">인기 아티클 (조회수 TOP 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topArticles.map((article, i) => (
                <div key={article.id} className="flex items-start gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {article.source_name} &middot; {article.view_count?.toLocaleString() ?? 0}회
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
