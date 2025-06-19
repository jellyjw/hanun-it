import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceRoleClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchValue = searchParams.get('searchValue');
    const sort = searchParams.get('sort') || 'latest'; // latest, popular, comments
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || 'all'; // all, news, security, startup
    const offset = (page - 1) * limit;

    console.log('🔍 IT 뉴스 조회 API 호출:', {
      searchValue,
      sort,
      page,
      limit,
      category,
      timestamp: new Date().toISOString(),
    });

    // 서비스 역할 키가 있으면 서비스 클라이언트 사용, 없으면 일반 클라이언트 사용
    let supabase;
    const hasServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasServiceKey) {
      console.log('🔑 서비스 역할 키 사용하여 조회');
      try {
        supabase = createServiceRoleClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
      } catch (error) {
        console.error('서비스 클라이언트 생성 실패, 일반 클라이언트 사용:', error);
        supabase = await createClient();
      }
    } else {
      console.log('⚠️  서비스 역할 키 없음, 일반 클라이언트 사용');
      supabase = await createClient();
    }

    // 최대 조회수 조회 (HOT 뱃지용)
    let maxViewCountQuery = supabase
      .from('it_news')
      .select('view_count')
      .order('view_count', { ascending: false })
      .limit(1);

    // 검색어가 있는 경우 검색 조건 추가
    if (searchValue && searchValue.trim()) {
      maxViewCountQuery = maxViewCountQuery.or(
        `title.ilike.%${searchValue}%,description.ilike.%${searchValue}%,source_name.ilike.%${searchValue}%`,
      );
    }

    // 카테고리 필터 적용
    if (category && category !== 'all' && category !== 'it-news') {
      maxViewCountQuery = maxViewCountQuery.eq('category', category);
    }

    const { data: maxViewData, error: maxViewError } = await maxViewCountQuery;
    if (maxViewError) {
      console.error('최대 조회수 조회 오류:', maxViewError);
    }
    const maxViewCount = maxViewData?.[0]?.view_count || 0;

    // 먼저 총 개수를 조회
    let countQuery = supabase.from('it_news').select('*', { count: 'exact', head: true });

    // 검색어가 있는 경우 검색 조건 추가
    if (searchValue && searchValue.trim()) {
      countQuery = countQuery.or(
        `title.ilike.%${searchValue}%,description.ilike.%${searchValue}%,source_name.ilike.%${searchValue}%`,
      );
    }

    // 카테고리 필터 적용 (it-news는 제외)
    if (category && category !== 'all' && category !== 'it-news') {
      countQuery = countQuery.eq('category', category);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('개수 조회 오류:', countError);
      throw countError;
    }

    console.log(`📊 총 IT 뉴스 개수: ${count}`);

    // 실제 데이터 조회
    let dataQuery = supabase.from('it_news').select('*');

    // 검색어가 있는 경우 검색 조건 추가
    if (searchValue && searchValue.trim()) {
      dataQuery = dataQuery.or(
        `title.ilike.%${searchValue}%,description.ilike.%${searchValue}%,source_name.ilike.%${searchValue}%`,
      );
    }

    // 카테고리 필터 적용 (it-news는 제외)
    if (category && category !== 'all' && category !== 'it-news') {
      dataQuery = dataQuery.eq('category', category);
    }

    // 데이터 조회
    const { data: news, error } = await dataQuery;

    if (error) {
      console.error('IT 뉴스 데이터 조회 오류:', error);
      throw error;
    }

    console.log(`📰 조회된 IT 뉴스: ${news?.length || 0}개`);

    // 댓글 수 조회 (댓글순 정렬을 위해)
    let newsWithCommentCount = news || [];

    if (sort === 'comments') {
      // 모든 뉴스의 댓글 수를 조회
      const newsIds = (news || []).map((newsItem) => newsItem.id);

      if (newsIds.length > 0) {
        const { data: commentCounts } = await supabase
          .from('it_news_comments')
          .select('news_id')
          .in('news_id', newsIds);

        // 댓글 수를 계산하여 뉴스에 추가
        const commentCountMap = new Map();
        (commentCounts || []).forEach((comment) => {
          const count = commentCountMap.get(comment.news_id) || 0;
          commentCountMap.set(comment.news_id, count + 1);
        });

        newsWithCommentCount = (news || []).map((newsItem) => ({
          ...newsItem,
          comment_count: commentCountMap.get(newsItem.id) || 0,
        }));
      }
    }

    // 정렬 로직
    let sortedNews;

    if (sort === 'latest') {
      // 최신순: 발행일 기준
      sortedNews = newsWithCommentCount.sort((a, b) => {
        return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
      });
    } else if (sort === 'popular') {
      // 인기순: 조회수 > 최신순
      sortedNews = newsWithCommentCount.sort((a, b) => {
        const aViews = a.view_count || 0;
        const bViews = b.view_count || 0;

        if (aViews !== bViews) return bViews - aViews;

        return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
      });
    } else if (sort === 'comments') {
      // 댓글순: 댓글 수 > 조회수 > 최신순
      sortedNews = newsWithCommentCount.sort((a, b) => {
        const aComments = a.comment_count || 0;
        const bComments = b.comment_count || 0;

        if (aComments !== bComments) return bComments - aComments;

        const aViews = a.view_count || 0;
        const bViews = b.view_count || 0;

        if (aViews !== bViews) return bViews - aViews;

        return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
      });
    } else {
      // 기본값은 최신순
      sortedNews = newsWithCommentCount.sort((a, b) => {
        return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
      });
    }

    // 페이지네이션 적용
    const paginatedNews = sortedNews.slice(offset, offset + limit);

    const totalPages = Math.ceil((count || 0) / limit);

    console.log('✅ IT 뉴스 조회 완료:', {
      total: count,
      returned: paginatedNews.length,
      page,
      totalPages,
    });

    return NextResponse.json({
      success: true,
      articles: paginatedNews.map((newsItem) => ({
        ...newsItem,
        is_domestic: true, // IT 뉴스는 모두 국내
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      searchValue,
      sort,
      category,
      maxViewCount, // HOT 뱃지 판단을 위한 최대 조회수 추가
    });
  } catch (error) {
    console.error('❌ IT 뉴스 조회 중 오류:', error);
    return NextResponse.json({ success: false, error: 'IT 뉴스 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
