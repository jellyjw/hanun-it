import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceRoleClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchValue = searchParams.get('searchValue');
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || 'all';
    const offset = (page - 1) * limit;

    // console.log('🔍 IT 뉴스 조회 API 호출:', {
    //   searchValue,
    //   sort,
    //   page,
    //   limit,
    //   category,
    //   timestamp: new Date().toISOString(),
    // });

    // 서비스 역할 키가 있으면 서비스 클라이언트 사용, 없으면 일반 클라이언트 사용
    let supabase;
    const hasServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasServiceKey) {
      try {
        supabase = createServiceRoleClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
      } catch (error) {
        supabase = await createClient();
      }
    } else {
      supabase = await createClient();
    }

    // 단일 쿼리로 최적화
    let query = supabase
      .from('it_news')
      .select('id, title, description, link, pub_date, source_name, category, thumbnail, view_count', {
        count: 'exact',
      });

    // 검색어 필터
    if (searchValue && searchValue.trim()) {
      query = query.or(
        `title.ilike.%${searchValue}%,description.ilike.%${searchValue}%,source_name.ilike.%${searchValue}%`,
      );
    }

    // 카테고리 필터
    if (category && category !== 'all' && category !== 'it-news') {
      query = query.eq('category', category);
    }

    // DB 레벨에서 정렬
    if (sort === 'latest') {
      query = query.order('pub_date', { ascending: false });
    } else if (sort === 'popular') {
      query = query
        .order('view_count', { ascending: false, nullsFirst: false })
        .order('pub_date', { ascending: false });
    } else if (sort === 'comments') {
      // 댓글순은 별도 처리
      query = query.order('pub_date', { ascending: false });
    }

    // 페이지네이션
    query = query.range(offset, offset + limit - 1);

    const { data: news, error, count } = await query;

    if (error) {
      console.error('IT 뉴스 데이터 조회 오류:', error);
      throw error;
    }

    // console.log(`📰 조회된 IT 뉴스: ${news?.length || 0}개`);

    let newsWithCommentCount = news || [];

    // 댓글순인 경우만 댓글 수 조회
    if (sort === 'comments' && news && news.length > 0) {
      const newsIds = news.map((newsItem) => newsItem.id);

      const { data: commentCounts } = await supabase.from('it_news_comments').select('news_id').in('news_id', newsIds);

      const commentCountMap = new Map();
      (commentCounts || []).forEach((comment) => {
        const count = commentCountMap.get(comment.news_id) || 0;
        commentCountMap.set(comment.news_id, count + 1);
      });

      newsWithCommentCount = news.map((newsItem) => ({
        ...newsItem,
        comment_count: commentCountMap.get(newsItem.id) || 0,
      }));

      // 댓글순 정렬
      newsWithCommentCount.sort((a: any, b: any) => {
        const aComments = a.comment_count || 0;
        const bComments = b.comment_count || 0;
        if (aComments !== bComments) return bComments - aComments;

        const aViews = a.view_count || 0;
        const bViews = b.view_count || 0;
        if (aViews !== bViews) return bViews - aViews;

        return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
      });
    }

    const maxViewCount = newsWithCommentCount[0]?.view_count || 0;
    const totalPages = Math.ceil((count || 0) / limit);

    // console.log('✅ IT 뉴스 조회 완료:', {
    //   total: count,
    //   returned: newsWithCommentCount.length,
    //   page,
    //   totalPages,
    // });

    const response = NextResponse.json({
      success: true,
      articles: newsWithCommentCount.map((newsItem) => ({
        ...newsItem,
        is_domestic: true,
        // description 길이 제한 (응답 크기 최적화)
        description: newsItem.description?.length > 200 
          ? newsItem.description.substring(0, 200) + '...' 
          : newsItem.description,
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
      maxViewCount,
    });

    // 캐시 헤더 추가
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error('❌ IT 뉴스 조회 중 오류:', error);
    return NextResponse.json({ success: false, error: 'IT 뉴스 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
