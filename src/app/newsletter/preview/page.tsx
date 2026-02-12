'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

export default function NewsletterPreviewPage() {
  const { user, loading: authLoading } = useAuth();
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchPreview();
    }
  }, [user, authLoading]);

  async function fetchPreview() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/newsletter/preview', {
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '미리보기를 불러올 수 없습니다.');
      }

      const htmlContent = await response.text();
      setHtml(htmlContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-sm px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <h1 className="mb-2 text-lg font-semibold">로그인이 필요합니다</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          뉴스레터 미리보기를 확인하려면 로그인해주세요
        </p>
        <Button asChild size="sm">
          <Link href="/login">로그인</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href="/mypage"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>돌아가기</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPreview}
            disabled={loading}
            className="h-8 text-xs"
          >
            {loading ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3 w-3" />
            )}
            새로고침
          </Button>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* 안내 */}
        <div className="mb-6 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{user?.email}</span>
            으로 발송될 이메일 미리보기
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-gray-800">
            <p className="mb-4 text-sm text-red-500">{error}</p>
            <Button size="sm" onClick={fetchPreview}>
              다시 시도
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <iframe
              srcDoc={html}
              className="min-h-[700px] w-full border-0"
              title="Newsletter Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
