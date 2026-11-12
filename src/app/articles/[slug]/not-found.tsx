import Link from 'next/link';

export default function ArticleNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-6xl">🔍</div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">아티클을 찾을 수 없습니다</h1>
      <p className="mb-6 text-gray-600">삭제되었거나 주소가 변경된 아티클일 수 있어요.</p>
      <Link
        href="/articles"
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
        목록으로 돌아가기
      </Link>
    </div>
  );
}
