/**
 * URL 생성 및 관리를 위한 유틸리티 함수들
 */

/**
 * 사이트 기본 URL 반환
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://hanun-it.vercel.app';
}

/**
 * 절대 URL 생성
 */
export function getAbsoluteUrl(path: string = ''): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * 아티클 페이지 URL 생성
 */
export function getArticleUrl(articleId: string): string {
  return getAbsoluteUrl(`/articles/${articleId}`);
}

/**
 * 이미지 URL 생성
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return getAbsoluteUrl('/assets/logo/logo.png');
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  return getAbsoluteUrl(imagePath);
}

/**
 * 사이트맵 URL 생성
 */
export function getSitemapUrl(): string {
  return getAbsoluteUrl('/sitemap.xml');
}

/**
 * 개발 환경 확인
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * 프로덕션 환경 확인
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
