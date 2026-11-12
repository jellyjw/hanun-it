'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ArticleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // 서버/클라이언트 렌더 중 발생한 오류를 기록(운영 모니터링 연동 지점)
    console.error('아티클 상세 렌더 오류:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-6xl">⚠️</div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">아티클을 불러오지 못했습니다</h1>
      <p className="mb-6 text-gray-600">일시적인 오류일 수 있어요. 잠시 후 다시 시도해 주세요.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          다시 시도
        </button>
        <Link
          href="/articles"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-muted">
          목록으로
        </Link>
      </div>
    </div>
  );
}
