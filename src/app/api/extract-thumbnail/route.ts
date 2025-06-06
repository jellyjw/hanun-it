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

      // 1. Open Graph 이미지
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) {
        thumbnail = ogImage;
      }

      // 2. Twitter Card 이미지
      if (!thumbnail) {
        const twitterImage = $('meta[name="twitter:image"]').attr('content');
        if (twitterImage) {
          thumbnail = twitterImage;
        }
      }

      // 3. 첫 번째 article 내 이미지
      if (!thumbnail) {
        const articleImage = $('article img').first().attr('src');
        if (articleImage) {
          thumbnail = articleImage;
        }
      }

      // 4. 첫 번째 content 영역 이미지
      if (!thumbnail) {
        const contentImage = $('.content img, .post-content img, .entry-content img').first().attr('src');
        if (contentImage) {
          thumbnail = contentImage;
        }
      }

      // 5. 일반 첫 번째 이미지
      if (!thumbnail) {
        const firstImage = $('img').first().attr('src');
        if (firstImage) {
          thumbnail = firstImage;
        }
      }

      // 상대 URL을 절대 URL로 변환
      if (thumbnail && !thumbnail.startsWith('http')) {
        const baseUrl = new URL(url);
        thumbnail = new URL(thumbnail, baseUrl.origin).href;
      }

      // 이미지 URL 유효성 검사
      if (thumbnail) {
        try {
          const imageController = new AbortController();
          const imageTimeoutId = setTimeout(() => imageController.abort(), 5000);

          const imageResponse = await fetch(thumbnail, {
            method: 'HEAD',
            signal: imageController.signal,
          });

          clearTimeout(imageTimeoutId);

          if (!imageResponse.ok) {
            thumbnail = null;
          }
        } catch {
          thumbnail = null;
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
