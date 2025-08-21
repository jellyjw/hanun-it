/**
 * URL 생성 및 관리를 위한 유틸리티 함수들
 */

/**
 * 사이트 기본 URL 반환 (커스텀 도메인 우선)
 */
export function getSiteUrl(): string {
  // 개발 환경에서도 실제 도메인 사용 (사이트맵용)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // 프로덕션 환경
  if (process.env.NODE_ENV === 'production') {
    return 'https://hanun-it.com';
  }

  // 개발 환경이지만 실제 URL이 필요한 경우 (예: 사이트맵)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // 로컬 개발 환경
  return 'https://hanun-it.com';
}

/**
 * Vercel 기본 URL 반환
 */
export function getVercelUrl(): string {
  return process.env.NEXT_PUBLIC_VERCEL_URL || 'https://hanun-it.vercel.app';
}

/**
 * 현재 도메인 확인
 */
export function getCurrentDomain(): string {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return getSiteUrl();
}

/**
 * 도메인별 URL 생성 (현재 도메인에 맞춰)
 */
export function getDomainSpecificUrl(path: string = ''): string {
  const currentDomain = getCurrentDomain();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (currentDomain === 'hanun-it.com' || currentDomain === 'www.hanun-it.com') {
    return `https://hanun-it.com${cleanPath}`;
  }

  if (currentDomain === 'hanun-it.vercel.app') {
    return `https://hanun-it.vercel.app${cleanPath}`;
  }

  // 기본값으로 커스텀 도메인 사용
  return `https://hanun-it.com${cleanPath}`;
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
