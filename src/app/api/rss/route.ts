import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { createClient } from "@/utils/supabase/server";
import { RSS_SOURCES } from "./sources";

const parser = new Parser();

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const articles = [];

    for (const source of RSS_SOURCES) {
      try {
        console.log(`Fetching RSS from: ${source.name}`);
        const feed = await parser.parseURL(source.url);

        for (const item of feed.items) {
          const article = {
            title: item.title || "",
            description: item.contentSnippet || item.content || "",
            content: item.content || "",
            link: item.link || "",
            pub_date: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : new Date().toISOString(),
            source_name: source.name,
            source_url: source.url,
            category: source.category,
            is_domestic: source.isDomestic,
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
