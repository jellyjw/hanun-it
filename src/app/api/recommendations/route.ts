import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getRecommendations } from '@/lib/recommendations/content-based';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // 콘텐츠 기반 추천 시도
    const recommendations = await getRecommendations(supabase, user.id, limit);

    // 추천 결과가 부족하면 인기 아티클로 보충
    if (recommendations.length < limit) {
      const existingIds = new Set(recommendations.map((r) => r.id));
      const needed = limit - recommendations.length;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: popular } = await supabase
        .from('articles')
        .select(
          'id, title, description, source_name, category, is_domestic, pub_date, thumbnail, view_count, like_count',
        )
        .gte('pub_date', sevenDaysAgo.toISOString())
        .order('view_count', { ascending: false })
        .limit(needed + 10);

      if (popular) {
        for (const article of popular) {
          if (recommendations.length >= limit) break;
          if (!existingIds.has(article.id)) {
            recommendations.push({ ...article, score: 0 });
            existingIds.add(article.id);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      articles: recommendations,
    });
  } catch (error) {
    console.error('추천 아티클 조회 오류:', error);
    return NextResponse.json({ success: false, error: '추천 아티클 조회에 실패했습니다.' }, { status: 500 });
  }
}
