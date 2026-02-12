import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '구독 취소 완료 - 한눈IT',
  description: '뉴스레터 구독이 취소되었습니다.',
};

export default function UnsubscribedPage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-sm items-center justify-center px-4 py-10">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Mail className="h-5 w-5 text-muted-foreground" />
        </div>

        <h1 className="mb-2 text-lg font-semibold">구독이 취소되었습니다</h1>

        <p className="mb-6 text-sm text-muted-foreground">
          언제든지 마이페이지에서 다시 구독하실 수 있어요
        </p>

        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <ArrowLeft className="mr-1.5 h-3 w-3" />
            홈으로
          </Link>
        </Button>
      </div>
    </div>
  );
}
