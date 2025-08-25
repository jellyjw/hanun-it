import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getSiteUrl, getAbsoluteUrl, getImageUrl } from '@/utils/url';

const SITE_URL = process.env.NEXT_PUBLIC_CUSTOM_DOMAIN || 'https://hanun-it.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '한눈IT - 국내, 해외의 IT 최신 아티클을 한눈에',
    template: '%s | 한눈IT',
  },
  description:
    '최신 IT 뉴스와 기술 트렌드를 한눈에 확인하세요. 개발자와 IT 전문가를 위한 큐레이션된 콘텐츠를 제공합니다. 국내외 IT 뉴스, 기술 블로그, 개발자 커뮤니티의 인기 콘텐츠를 매일 업데이트합니다.',
  keywords: [
    'IT뉴스',
    '기술뉴스',
    '개발자뉴스',
    '프로그래밍',
    '소프트웨어',
    '하드웨어',
    '스타트업',
    '테크뉴스',
    '기술블로그',
    '개발자커뮤니티',
  ],
  authors: [{ name: '한눈IT Team' }],
  creator: '한눈IT Team',
  publisher: '한눈IT',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: '한눈IT - 국내, 해외의 IT 최신 아티클을 한눈에',
    description:
      '최신 IT 뉴스와 기술 트렌드를 한눈에 확인하세요. 개발자와 IT 전문가를 위한 큐레이션된 콘텐츠를 제공합니다.',
    url: SITE_URL,
    siteName: '한눈IT',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/assets/logo/logo.png`,
        width: 1200,
        height: 630,
        alt: '한눈IT 로고',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '한눈IT - 국내, 해외의 IT 최신 아티클을 한눈에',
    description:
      '최신 IT 뉴스와 기술 트렌드를 한눈에 확인하세요. 개발자와 IT 전문가를 위한 큐레이션된 콘텐츠를 제공합니다.',
    images: [`${SITE_URL}/assets/logo/logo.png`],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7127894498153967"
          crossOrigin="anonymous"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: '(window.adsbygoogle=window.adsbygoogle||[]).push({overlays:{bottom:false,top:false}});',
          }}
        />
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
            <Footer />
          </div>
        </Providers>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
