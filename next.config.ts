import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일 캐시
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'techblog.woowahan.com',
      },
      {
        protocol: 'http',
        hostname: '**', // 모든 도메인 허용 (개발환경용)
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/articles',
        permanent: true, // 301 리디렉션 (SEO에 좋음)
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // 도메인 설정
  env: {
    CUSTOM_DOMAIN: 'hanun-it.com',
    VERCEL_DOMAIN: 'hanun-it.vercel.app',
  },
  // 호스트 설정 (Vercel 배포 시에만 적용)
  assetPrefix: process.env.VERCEL ? undefined : undefined,
};

export default nextConfig;
