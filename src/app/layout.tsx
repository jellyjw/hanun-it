import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: '한눈IT - 국내, 해외의 IT 최신 아티클을 한눈에',
  description:
    '최신 IT 뉴스와 기술 트렌드를 한눈에 확인하세요. 개발자와 IT 전문가를 위한 큐레이션된 콘텐츠를 제공합니다.',
  keywords: 'IT뉴스, 기술뉴스, 개발자뉴스, 프로그래밍, 소프트웨어, 하드웨어, 스타트업',
  authors: [{ name: '한눈IT Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#924DBF' },
    { media: '(prefers-color-scheme: dark)', color: '#746186' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
