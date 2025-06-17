import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
    }

    // AbortController로 타임아웃 구현
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    try {
      // URL에서 HTML 가져오기
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          {
            error: 'URL을 가져올 수 없습니다.',
            thumbnail: null,
          },
          { status: 400 },
        );
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      let thumbnail = null;

      // 썸네일 추출 전략 (우선순위 순)
      const strategies = [
        // 1. Open Graph 이미지 (가장 높은 우선순위)
        () => $('meta[property="og:image"]').attr('content'),
        () => $('meta[property="og:image:url"]').attr('content'),

        // 2. Twitter Card 이미지
        () => $('meta[name="twitter:image"]').attr('content'),
        () => $('meta[name="twitter:image:src"]').attr('content'),

        // 3. 메타 이미지 태그들
        () => $('meta[name="image"]').attr('content'),
        () => $('meta[itemprop="image"]').attr('content'),
        () => $('meta[name="thumbnail"]').attr('content'),

        // 4. 링크 태그
        () => $('link[rel="image_src"]').attr('href'),
        () => $('link[rel="apple-touch-icon"]').attr('href'),

        // 5. 구조화된 데이터
        () => $('script[type="application/ld+json"]').text() && extractImageFromJsonLd($),

        // 6. 특정 사이트별 최적화
        () => extractSiteSpecificThumbnail($, url),

        // 7. 컨텐츠 영역 이미지들
        () => $('article img').first().attr('src'),
        () => $('.post-content img, .entry-content img, .content img').first().attr('src'),
        () => $('main img').first().attr('src'),
        () => $('.post img, .blog-post img').first().attr('src'),

        // 8. 기타 이미지 태그들
        () => $('img[class*="featured"], img[class*="thumbnail"], img[class*="hero"]').first().attr('src'),
        () => $('img[id*="featured"], img[id*="thumbnail"], img[id*="hero"]').first().attr('src'),

        // 9. 첫 번째 이미지 (마지막 수단)
        () => $('img').first().attr('src'),
      ];

      // 각 전략을 순서대로 시도
      for (const strategy of strategies) {
        try {
          const result = strategy();
          if (result && result.trim()) {
            thumbnail = result.trim();
            break;
          }
        } catch (error) {
          // 전략 실패 시 다음 전략으로 넘어감
          continue;
        }
      }

      // 상대 URL을 절대 URL로 변환
      if (thumbnail && !thumbnail.startsWith('http')) {
        try {
          const baseUrl = new URL(url);
          thumbnail = new URL(thumbnail, baseUrl.origin).href;
        } catch {
          thumbnail = null;
        }
      }

      // 이미지 URL 유효성 검사 및 필터링
      if (thumbnail) {
        // 너무 작은 이미지나 아이콘 제외
        if (thumbnail.includes('favicon') || thumbnail.includes('logo') || thumbnail.includes('icon')) {
          // 크기 정보가 있는 경우만 제외
          if (thumbnail.includes('16x16') || thumbnail.includes('32x32') || thumbnail.includes('64x64')) {
            thumbnail = null;
          }
        }

        // 이미지 존재 여부 확인
        if (thumbnail) {
          try {
            const imageController = new AbortController();
            const imageTimeoutId = setTimeout(() => imageController.abort(), 5000);

            const imageResponse = await fetch(thumbnail, {
              method: 'HEAD',
              signal: imageController.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              },
            });

            clearTimeout(imageTimeoutId);

            if (!imageResponse.ok) {
              thumbnail = null;
            } else {
              // 이미지 크기 확인
              const contentLength = imageResponse.headers.get('content-length');
              if (contentLength && parseInt(contentLength) < 1000) {
                // 1KB 미만의 이미지는 제외 (보통 아이콘)
                thumbnail = null;
              }
            }
          } catch {
            thumbnail = null;
          }
        }
      }

      return NextResponse.json({
        url,
        thumbnail,
        success: true,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('썸네일 추출 오류:', error);
    return NextResponse.json(
      {
        error: '썸네일 추출 중 오류가 발생했습니다.',
        thumbnail: null,
        success: false,
      },
      { status: 500 },
    );
  }
}

// JSON-LD에서 이미지 추출
function extractImageFromJsonLd($: cheerio.CheerioAPI): string | null {
  try {
    const jsonLdScripts = $('script[type="application/ld+json"]');
    for (let i = 0; i < jsonLdScripts.length; i++) {
      const script = jsonLdScripts.eq(i);
      const jsonText = script.text();
      if (jsonText) {
        const data = JSON.parse(jsonText);
        if (data.image) {
          if (typeof data.image === 'string') {
            return data.image;
          } else if (Array.isArray(data.image) && data.image.length > 0) {
            return data.image[0];
          } else if (data.image.url) {
            return data.image.url;
          }
        }
      }
    }
  } catch {
    // JSON 파싱 실패 시 무시
  }
  return null;
}

// 특정 사이트별 최적화된 썸네일 추출
function extractSiteSpecificThumbnail($: cheerio.CheerioAPI, url: string): string | null {
  const domain = new URL(url).hostname.toLowerCase();

  // 네이버 D2
  if (domain.includes('d2.naver.com')) {
    return $('.post-header img').first().attr('src') || $('.post-content img').first().attr('src') || null;
  }

  // 우아한형제들
  if (domain.includes('techblog.woowahan.com') || domain.includes('techblog.woowa.in')) {
    return $('.post-thumbnail img').first().attr('src') || $('.wp-post-image').first().attr('src') || null;
  }

  // 토스
  if (domain.includes('toss.tech')) {
    return $('meta[property="og:image"]').attr('content') || $('.article-image img').first().attr('src') || null;
  }

  // 당근마켓 (Medium)
  if (domain.includes('medium.com')) {
    return $('meta[property="og:image"]').attr('content') || $('.graf-image').first().attr('src') || null;
  }

  // 라인
  if (domain.includes('engineering.linecorp.com')) {
    return $('.post-header-image img').first().attr('src') || $('.post-content img').first().attr('src') || null;
  }

  // GitHub
  if (domain.includes('github.blog') || domain.includes('github.com')) {
    return $('.post-header img').first().attr('src') || $('.markdown-body img').first().attr('src') || null;
  }

  // Stack Overflow
  if (domain.includes('stackoverflow.blog')) {
    return $('.post-featured-image img').first().attr('src') || null;
  }

  // Dev.to
  if (domain.includes('dev.to')) {
    return $('.crayons-article__cover img').first().attr('src') || null;
  }

  return null;
}
