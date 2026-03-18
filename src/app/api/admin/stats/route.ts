import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkIsAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const isAdmin = await checkIsAdmin(supabase);

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Run all queries in parallel
    const [bySourceRes, byCategoryRes, byDateRes, commentStatsRes] = await Promise.all([
      // Articles by source
      supabase.rpc('count_articles_by_source', { since_date: since.toISOString() }).select('*'),

      // Articles by category
      supabase.rpc('count_articles_by_category', { since_date: since.toISOString() }).select('*'),

      // Articles by date (daily)
      supabase.rpc('count_articles_by_date', { since_date: since.toISOString() }).select('*'),

      // Comment stats
      supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since.toISOString()),
    ]);

    // Fallback: if RPCs don't exist, use simple queries
    let bySource = bySourceRes.data;
    let byCategory = byCategoryRes.data;
    let byDate = byDateRes.data;

    if (bySourceRes.error) {
      const { data } = await supabase
        .from('articles')
        .select('source_name')
        .gte('pub_date', since.toISOString());
      const counts: Record<string, number> = {};
      (data ?? []).forEach((a) => {
        counts[a.source_name] = (counts[a.source_name] || 0) + 1;
      });
      bySource = Object.entries(counts)
        .map(([source_name, count]) => ({ source_name, count }))
        .sort((a, b) => b.count - a.count);
    }

    if (byCategoryRes.error) {
      const { data } = await supabase
        .from('articles')
        .select('category')
        .gte('pub_date', since.toISOString());
      const counts: Record<string, number> = {};
      (data ?? []).forEach((a) => {
        counts[a.category] = (counts[a.category] || 0) + 1;
      });
      byCategory = Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
    }

    if (byDateRes.error) {
      const { data } = await supabase
        .from('articles')
        .select('pub_date')
        .gte('pub_date', since.toISOString())
        .order('pub_date', { ascending: true });
      const counts: Record<string, number> = {};
      (data ?? []).forEach((a) => {
        const date = new Date(a.pub_date).toISOString().split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
      });
      byDate = Object.entries(counts).map(([date, count]) => ({ date, count }));
    }

    return NextResponse.json({
      success: true,
      stats: {
        bySource,
        byCategory,
        byDate,
        commentCount: commentStatsRes.count ?? 0,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, error: '통계 조회 실패' }, { status: 500 });
  }
}
