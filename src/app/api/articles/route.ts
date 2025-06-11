import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isDomestic = searchParams.get('domestic');
    const searchValue = searchParams.get('searchValue');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // 최대 조회수 조회 (HOT 뱃지용)
    let maxViewCountQuery = supabase
      .from('articles')
      .select('view_count')
      .order('view_count', { ascending: false })
      .limit(1);

    // 검색어가 있는 경우 검색 조건 추가
    if (searchValue && searchValue.trim()) {
      maxViewCountQuery = maxViewCountQuery.or(
        `title.ilike.%${searchValue}%,description.ilike.%${searchValue}%,source_name.ilike.%${searchValue}%`,
      );
    }

    // 필터 적용
    if (category && category !== 'all') {
      if (category === 'domestic') {
        maxViewCountQuery = maxViewCountQuery.eq('is_domestic', true);
      } else if (category === 'foreign') {
        maxViewCountQuery = maxViewCountQuery.eq('is_domestic', false);
      } else if (category === 'weekly') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        maxViewCountQuery = maxViewCountQuery.gte('pub_date', sevenDaysAgo.toISOString());
      } else {
        maxViewCountQuery = maxViewCountQuery.eq('category', category);
      }
    }

    // 기존 domestic 파라미터 지원 (하위 호환성)
    if (isDomestic !== null && category !== 'domestic' && category !== 'foreign') {
      maxViewCountQuery = maxViewCountQuery.eq('is_domestic', isDomestic === 'true');
    }

    const { data: maxViewData } = await maxViewCountQuery;
    const maxViewCount = maxViewData?.[0]?.view_count || 0;

    // 먼저 총 개수를 조회
    let countQuery = supabase.from('articles').select('*', { count: 'exact', head: true });

    // 검색어가 있는 경우 검색 조건 추가
    if (searchValue && searchValue.trim()) {
      countQuery = countQuery.or(
        `title.ilike.%${searchValue}%,description.ilike.%${searchValue}%,source_name.ilike.%${searchValue}%`,
      );
    }

    // 필터 적용 (count 쿼리에도 동일하게 적용)
    if (category && category !== 'all') {
      if (category === 'domestic') {
        countQuery = countQuery.eq('is_domestic', true);
      } else if (category === 'foreign') {
        countQuery = countQuery.eq('is_domestic', false);
      } else if (category === 'weekly') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        countQuery = countQuery.gte('pub_date', sevenDaysAgo.toISOString());
      } else {
        countQuery = countQuery.eq('category', category);
      }
    }

    // 기존 domestic 파라미터 지원 (하위 호환성)
    if (isDomestic !== null && category !== 'domestic' && category !== 'foreign') {
      countQuery = countQuery.eq('is_domestic', isDomestic === 'true');
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

    // 실제 데이터 조회
    let dataQuery = supabase.from('articles').select('*');

    // 검색어가 있는 경우 검색 조건 추가
    if (searchValue && searchValue.trim()) {
      dataQuery = dataQuery.or(
        `title.ilike.%${searchValue}%,description.ilike.%${searchValue}%,source_name.ilike.%${searchValue}%`,
      );
    }

    // 필터 적용
    if (category && category !== 'all') {
      if (category === 'domestic') {
        dataQuery = dataQuery.eq('is_domestic', true);
      } else if (category === 'foreign') {
        dataQuery = dataQuery.eq('is_domestic', false);
      } else if (category === 'weekly') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        dataQuery = dataQuery.gte('pub_date', sevenDaysAgo.toISOString());
      } else {
        dataQuery = dataQuery.eq('category', category);
      }
    }

    // 기존 domestic 파라미터 지원 (하위 호환성)
    if (isDomestic !== null && category !== 'domestic' && category !== 'foreign') {
      dataQuery = dataQuery.eq('is_domestic', isDomestic === 'true');
    }

    // 데이터 조회
    const { data: articles, error } = await dataQuery;

    if (error) {
      throw error;
    }

    // 정렬 로직 - 썸네일이 있고 HOT한 아티클을 우선적으로 표시
    let sortedArticles;
    if (category === 'weekly') {
      // 주간 인기는 기존 로직 유지 (조회수 우선)
      sortedArticles = (articles || []).sort((a, b) => {
        const aViews = a.view_count || 0;
        const bViews = b.view_count || 0;

        if (aViews !== bViews) return bViews - aViews;

        return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
      });
    } else {
      // 다른 카테고리들은 썸네일 유무 > 조회수 > 최신순으로 정렬
      sortedArticles = (articles || []).sort((a, b) => {
        // 1. 썸네일 유무로 먼저 정렬 (썸네일 있는 것이 우선)
        const aHasThumbnail = a.thumbnail && a.thumbnail.trim() !== '';
        const bHasThumbnail = b.thumbnail && b.thumbnail.trim() !== '';

        if (aHasThumbnail && !bHasThumbnail) return -1;
        if (!aHasThumbnail && bHasThumbnail) return 1;

        // 2. 조회수로 정렬 (높은 것이 우선)
        const aViews = a.view_count || 0;
        const bViews = b.view_count || 0;

        if (aViews !== bViews) return bViews - aViews;

        // 3. 날짜로 정렬 (최신이 우선)
        return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
      });
    }

    // 페이지네이션 적용
    const paginatedArticles = sortedArticles.slice(offset, offset + limit);

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      articles: paginatedArticles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      searchValue,
      maxViewCount, // HOT 뱃지 판단을 위한 최대 조회수 추가
    });
  } catch (error) {
    console.error('아티클 조회 중 오류:', error);
    return NextResponse.json({ success: false, error: '아티클 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
