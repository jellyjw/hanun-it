import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // 전체 아티클 수
    const { count: totalCount } = await supabase.from('articles').select('*', { count: 'exact', head: true });

    // 국내 아티클 수
    const { count: domesticCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_domestic', true);

    // 해외 아티클 수
    const { count: foreignCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_domestic', false);

    // 주간 인기 아티클 수 (최근 7일간 조회수가 있는 아티클)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: weeklyCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .gte('pub_date', sevenDaysAgo.toISOString())
      .not('view_count', 'is', null)
      .gt('view_count', 0);

    return NextResponse.json({
      total: totalCount || 0,
      domestic: domesticCount || 0,
      foreign: foreignCount || 0,
      weekly: weeklyCount || 0,
    });
  } catch (error) {
    console.error('통계 조회 중 오류:', error);
    return NextResponse.json({ error: '통계 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
