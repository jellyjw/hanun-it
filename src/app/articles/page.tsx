import type { Metadata } from 'next';
import ArticlesClient from './ArticlesClient';

// 목록 페이지는 클라이언트에서 상호작용/데이터 패칭을 처리하지만,
// 서버 컴포넌트 래퍼에서 페이지 단위 메타데이터를 제공해 SEO를 개선한다.
export const metadata: Metadata = {
  // 루트 레이아웃의 title.template('%s | 한눈IT')이 접미사를 붙이므로 여기서는 제목 본문만 지정한다.
  title: '한눈에 모아보는 IT 뉴스',
  description: '국내외 최신 IT 기술 아티클과 뉴스, 인기 영상을 한눈에 모아보세요.',
  keywords: ['IT뉴스', '기술블로그', '개발자뉴스', 'IT아티클', '한눈IT'],
  alternates: {
    canonical: 'https://hanun-it.com/articles',
  },
  openGraph: {
    title: '한눈에 모아보는 IT 뉴스 | 한눈IT',
    description: '국내외 최신 IT 기술 아티클과 뉴스, 인기 영상을 한눈에 모아보세요.',
    url: 'https://hanun-it.com/articles',
    siteName: '한눈IT',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function ArticlesPage() {
  return <ArticlesClient />;
}
