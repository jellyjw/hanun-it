import * as cheerio from "cheerio";

export async function fetchMetaImage(url: string): Promise<string | null> {
  if (!url) return null;

  try {
    console.log(`🖼️  메타 이미지 가져오는 중: ${url}`);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MetaImageBot/1.0)",
      },
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    });

    if (!response.ok) {
      console.warn(`⚠️  페이지 로드 실패: ${url} (${response.status})`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 메타 이미지 우선순위별로 시도
    const metaImageSelectors = [
      'meta[property="og:image"]', // Open Graph 이미지
      'meta[property="og:image:url"]', // Open Graph 이미지 URL
      'meta[name="twitter:image"]', // Twitter 카드 이미지
      'meta[name="twitter:image:src"]', // Twitter 이미지 소스
      'meta[property="article:image"]', // 아티클 이미지
      'meta[name="image"]', // 일반 메타 이미지
      'link[rel="image_src"]', // 이미지 소스 링크
    ];

    for (const selector of metaImageSelectors) {
      const content = $(selector).attr("content") || $(selector).attr("href");
      if (content) {
        // 상대 URL을 절대 URL로 변환
        let imageUrl = content;
        if (content.startsWith("/")) {
          const urlObj = new URL(url);
          imageUrl = `${urlObj.protocol}//${urlObj.host}${content}`;
        } else if (content.startsWith("//")) {
          const urlObj = new URL(url);
          imageUrl = `${urlObj.protocol}${content}`;
        }

        console.log(`✅ 메타 이미지 발견: ${imageUrl}`);
        return imageUrl;
      }
    }

    // 메타 이미지가 없으면 첫 번째 img 태그 시도
    const firstImg = $(
      "article img, main img, .content img, .post img"
    ).first();
    if (firstImg.length > 0) {
      let imgSrc = firstImg.attr("src") || firstImg.attr("data-src");
      if (imgSrc) {
        // 상대 URL 처리
        if (imgSrc.startsWith("/")) {
          const urlObj = new URL(url);
          imgSrc = `${urlObj.protocol}//${urlObj.host}${imgSrc}`;
        } else if (imgSrc.startsWith("//")) {
          const urlObj = new URL(url);
          imgSrc = `${urlObj.protocol}${imgSrc}`;
        }

        console.log(`✅ 첫 번째 이미지 사용: ${imgSrc}`);
        return imgSrc;
      }
    }

    console.log(`❌ 메타 이미지를 찾을 수 없음: ${url}`);
    return null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(`⏰ 메타 이미지 가져오기 타임아웃: ${url}`);
    } else {
      console.error(`❌ 메타 이미지 가져오기 오류: ${url}`, error);
    }
    return null;
  }
}
