import * as cheerio from 'cheerio';

// 썸네일 추출 로직
export async function extractThumbnailFromUrl(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    let thumbnail: string | null = null;

    const strategies = [
      () => $("meta[property='og:image']").attr('content'),
      () => $("meta[property='twitter:image']").attr('content'),
      () => $("link[rel='image_src']").attr('href'),
      () => $('article img').first().attr('src'),
      () => $('img').first().attr('src'),
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result) {
        thumbnail = result;
        break;
      }
    }

    if (thumbnail && !thumbnail.startsWith('http')) {
      thumbnail = new URL(thumbnail, new URL(url).origin).href;
    }

    return thumbnail;
  } catch (error) {
    console.error(`썸네일 추출 실패 (${url}):`, error);
    return null;
  }
}
