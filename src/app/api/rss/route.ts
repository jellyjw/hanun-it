import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { createClient } from "@/utils/supabase/server";
import { RSS_SOURCES } from "./sources";

type CustomFeed = {
  title: string;
  description: string;
  items: CustomItem[];
};

type CustomItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  originContent?: string;
  enclosure?: {
    url?: string;
  };
  image?: {
    url?: string;
  };
};

// Parser 인스턴스 생성 시 customFields 설정
const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: [["content:encoded", "originContent"]],
  },
});

async function fetchMetaImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const ogImageMatch = html.match(
      /<meta\s+property="og:image"\s+content="([^"]+)"/i
    );
    const twitterImageMatch = html.match(
      /<meta\s+name="twitter:image"\s+content="([^"]+)"/i
    );

    return ogImageMatch?.[1] || twitterImageMatch?.[1] || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const articles = [];

    for (const source of RSS_SOURCES) {
      try {
        console.log(`Fetching RSS from: ${source.name}`);
        const feed = await parser.parseURL(source.url);
        console.log("Feed items:", feed.items[0]); // 첫 번째 아이템의 구조 확인용

        for (const item of feed.items) {
          let thumbnailUrl = item.enclosure?.url || item.image?.url || "";

          // if (!thumbnailUrl && item.link) {
          //   thumbnailUrl = (await fetchMetaImage(item.link)) || "";
          // }

          const article = {
            title: item.title || "",
            description: item.contentSnippet || item.content || "",
            summary: item.content || "",
            content: item.originContent || item.content || "",
            link: item.link || "",
            pub_date: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : new Date().toISOString(),
            source_name: source.name,
            source_url: source.url,
            category: source.category,
            is_domestic: source.isDomestic,
            thumbnail: thumbnailUrl,
            view_count: 0, // 기본 조회수 0으로 설정
          };

          // 중복 체크 후 삽입
          const { error } = await supabase.from("articles").upsert(article, {
            onConflict: "link",
            ignoreDuplicates: true,
          });

          if (!error) {
            articles.push(article);
          }
        }

        // RSS 소스 마지막 수집 시간 업데이트
        await supabase.from("rss_sources").upsert(
          {
            name: source.name,
            url: source.url,
            is_domestic: source.isDomestic,
            category: source.category,
            last_fetched: new Date().toISOString(),
          },
          { onConflict: "url" }
        );
      } catch (error) {
        console.error(`Error fetching RSS from ${source.name}:`, error);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${articles.length}개의 아티클을 수집했습니다.`,
      articles: articles.length,
    });
  } catch (error) {
    console.error("RSS 수집 중 오류:", error);
    return NextResponse.json(
      { success: false, error: "RSS 수집 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
