import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
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
};

export default nextConfig;
