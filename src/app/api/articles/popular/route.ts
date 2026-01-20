import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// 5분 캐싱
export const revalidate = 300;

export async function GET() {
  try {
    const supabase = await createClient();

    // 최근 7일 기준
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 최근 7일간의 아티클 조회
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, description, source_name, pub_date, view_count, like_count, thumbnail, link, category, is_domestic')
      .gte('pub_date', sevenDaysAgo.toISOString())
      .order('pub_date', { ascending: false });

    if (error) {
      throw error;
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: true,
        articles: [],
        updatedAt: new Date().toISOString(),
      });
    }

    // 점수 계산: view_count + (like_count * 10)
    // 좋아요에 가중치를 주어 더 의미있는 지표로 활용
    const articlesWithScore = articles.map((article) => ({
      ...article,
      score: (article.view_count || 0) + (article.like_count || 0) * 10,
    }));

    // 점수순으로 정렬
    articlesWithScore.sort((a, b) => b.score - a.score);

    // 상위 3개만 선택
    const topArticles = articlesWithScore.slice(0, 3);

    const response = NextResponse.json({
      success: true,
      articles: topArticles,
      updatedAt: new Date().toISOString(),
    });

    // 캐시 헤더 추가
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return response;
  } catch (error) {
    console.error('인기 아티클 조회 중 오류:', error);
    return NextResponse.json(
      { success: false, error: '인기 아티클 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
