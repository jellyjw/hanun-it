'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Source {
  id: number;
  name: string;
  url: string;
  category: string;
  is_domestic: boolean;
  is_active: boolean;
  last_fetched_at: string | null;
  article_count: number;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromConstants, setFromConstants] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', category: 'tech', is_domestic: true });

  useEffect(() => {
    fetchSources();
  }, []);

  async function fetchSources() {
    try {
      const res = await fetch('/api/admin/sources');
      const data = await res.json();
      if (data.success) {
        setSources(data.sources);
        setFromConstants(data.fromConstants ?? false);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!form.name || !form.url) return;
    const res = await fetch('/api/admin/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setForm({ name: '', url: '', category: 'tech', is_domestic: true });
      fetchSources();
    }
  }

  async function handleToggle(source: Source) {
    await fetch('/api/admin/sources', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: source.id, is_active: !source.is_active }),
    });
    fetchSources();
  }

  async function handleDelete(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await fetch(`/api/admin/sources?id=${id}`, { method: 'DELETE' });
    fetchSources();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">소스 관리</h1>
        {!fromConstants && (
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? '취소' : '소스 추가'}</Button>
        )}
      </div>

      {fromConstants && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              현재 소스 목록은 코드 상수(RSS_SOURCES)에서 불러온 것입니다. DB 테이블(rss_sources)을 생성하면
              직접 관리할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">새 소스 추가</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="소스 이름"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="RSS URL"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="tech">Tech</option>
                <option value="news">News</option>
                <option value="ai">AI</option>
                <option value="data">Data</option>
                <option value="community">Community</option>
                <option value="personal">Personal</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_domestic}
                  onChange={(e) => setForm({ ...form, is_domestic: e.target.checked })}
                />
                국내
              </label>
              <Button onClick={handleAdd}>추가</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">이름</th>
                  <th className="px-4 py-3 text-left font-medium">카테고리</th>
                  <th className="px-4 py-3 text-left font-medium">국내/해외</th>
                  <th className="px-4 py-3 text-left font-medium">상태</th>
                  <th className="px-4 py-3 text-left font-medium">URL</th>
                  {!fromConstants && <th className="px-4 py-3 text-right font-medium">작업</th>}
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{source.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" size="sm" showIcon={false}>
                        {source.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={source.is_domestic ? 'info-medium' : 'warning-medium'} size="sm" showIcon={false}>
                        {source.is_domestic ? '국내' : '해외'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={source.is_active ? 'success-medium' : 'destructive-medium'}
                        size="sm"
                        showIcon={false}
                      >
                        {source.is_active ? '활성' : '비활성'}
                      </Badge>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-xs text-muted-foreground">
                      {source.url}
                    </td>
                    {!fromConstants && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleToggle(source)}>
                            {source.is_active ? '비활성화' : '활성화'}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(source.id)}>
                            삭제
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
