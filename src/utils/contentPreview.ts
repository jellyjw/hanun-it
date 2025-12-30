/**
 * HTML에서 첫 번째 이미지 URL 추출
 */
export function extractFirstImage(html: string): string | null {
  if (!html) return null;

  // img 태그에서 src 추출
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : null;
}

/**
 * HTML에서 텍스트만 추출하여 미리보기 생성
 * @param html - HTML 콘텐츠
 * @param maxChars - 최대 글자 수 (기본값: 300)
 * @returns 미리보기 텍스트
 */
export function extractTextPreview(html: string, maxChars: number = 300): string {
  if (!html) return '';

  // HTML 태그 제거
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // style 태그 제거
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // script 태그 제거
    .replace(/<[^>]+>/g, ' ') // 모든 HTML 태그 제거
    .replace(/&nbsp;/g, ' ') // &nbsp; 공백으로 변환
    .replace(/&[a-z]+;/gi, '') // HTML 엔티티 제거
    .replace(/\s+/g, ' ') // 여러 공백을 하나로
    .trim();

  // 최대 글자 수로 자르기
  if (text.length <= maxChars) {
    return text;
  }

  // 문장 단위로 자르기 (마침표, 느낌표, 물음표 기준)
  const truncated = text.substring(0, maxChars);
  const sentences = truncated.split(/([.!?])\s+/);

  // 마지막 불완전한 문장 제거
  if (sentences.length > 1) {
    sentences.pop();
  }

  return sentences.join('').trim() + '...';
}

/**
 * 콘텐츠 미리보기 데이터 추출
 */
export function getContentPreview(html: string) {
  return {
    image: extractFirstImage(html),
    text: extractTextPreview(html, 250), // 약 3-4줄 분량
  };
}
