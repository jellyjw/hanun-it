import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function getNewsletterData() {
  const supabase = await createClient();

  const [allRes, activeRes, subscribersRes] = await Promise.all([
    supabase.from('newsletter_subscriptions').select('id', { count: 'exact', head: true }),
    supabase.from('newsletter_subscriptions').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('newsletter_subscriptions')
      .select('id, email, is_active, created_at, updated_at, unsubscribed_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  return {
    total: allRes.count ?? 0,
    active: activeRes.count ?? 0,
    subscribers: subscribersRes.data ?? [],
  };
}

export default async function NewsletterPage() {
  const data = await getNewsletterData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">뉴스레터 관리</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">전체 구독자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">활성 구독자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{data.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">구독 해지</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{data.total - data.active}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">구독자 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">이메일</th>
                  <th className="px-4 py-3 text-left font-medium">상태</th>
                  <th className="px-4 py-3 text-left font-medium">구독일</th>
                  <th className="px-4 py-3 text-left font-medium">해지일</th>
                </tr>
              </thead>
              <tbody>
                {data.subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      구독자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  data.subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{sub.email}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={sub.is_active ? 'success-medium' : 'destructive-medium'}
                          size="sm"
                          showIcon={false}
                        >
                          {sub.is_active ? '활성' : '해지'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleDateString('ko-KR') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
