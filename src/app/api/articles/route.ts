import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// 5분 캐싱
export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isDomestic = searchParams.get('domestic');
    const searchValue = searchParams.get('searchValue');
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 캐시 키 생성
    const cacheKey = `articles-${category}-${isDomestic}-${searchValue}-${sort}-${page}-${limit}`;

    const supabase = await createClient();

    // 단일 쿼리로 필요한 데이터만 조회
    let query = supabase
      .from('articles')
      .select('id, title, description, link, pub_date, source_name, category, is_domestic, thumbnail, view_count', {
        count: 'exact',
      });

    // 검색어 필터
    if (searchValue && searchValue.trim()) {
      query = query.or(
        `title.ilike.%${searchValue}%,description.ilike.%${searchValue}%,source_name.ilike.%${searchValue}%`,
      );
    }

    // 카테고리 필터
    if (category && category !== 'all') {
      if (category === 'domestic') {
        query = query.eq('is_domestic', true);
      } else if (category === 'foreign') {
        query = query.eq('is_domestic', false);
      } else if (category === 'ai-data') {
        // AI/Data 통합 카테고리 - ai 또는 data 중 하나라도 매칭
        query = query.in('category', ['ai', 'data']);
      } else if (category === 'weekly') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.gte('pub_date', sevenDaysAgo.toISOString());
      } else if (category === 'it-news') {
        try {
          const response = await fetch(`${request.url.replace('/api/articles', '/api/it-news')}`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`IT News API failed: ${response.statusText}`);
          }
          
          const data = await response.json();
          return NextResponse.json(data);
        } catch (error) {
          console.error('IT News API error:', error);
          return NextResponse.json({ 
            success: false, 
            articles: [], 
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
            error: 'IT 뉴스를 불러올 수 없습니다.' 
          });
        }
      } else {
        query = query.eq('category', category);
      }
    }

    // 기존 domestic 파라미터 지원
    if (isDomestic !== null && category !== 'domestic' && category !== 'foreign') {
      query = query.eq('is_domestic', isDomestic === 'true');
    }

    // DB 레벨에서 정렬 및 페이지네이션
    if (sort === 'latest') {
      query = query.order('pub_date', { ascending: false });
    } else if (sort === 'popular') {
      query = query
        .order('view_count', { ascending: false, nullsFirst: false })
        .order('pub_date', { ascending: false });
    } else if (sort === 'comments') {
      // 댓글순은 별도 처리 필요
      query = query.order('pub_date', { ascending: false });
    }

    // 페이지네이션
    query = query.range(offset, offset + limit - 1);

    const { data: articles, error, count } = await query;

    if (error) {
      throw error;
    }

    // 댓글 수 조회 (댓글순 정렬인 경우만)
    let articlesWithCommentCount = articles || [];

    if (sort === 'comments' && articles && articles.length > 0) {
      const articleIds = articles.map((article) => article.id);

      const { data: commentCounts } = await supabase.from('comments').select('article_id').in('article_id', articleIds);

      const commentCountMap = new Map();
      (commentCounts || []).forEach((comment) => {
        const count = commentCountMap.get(comment.article_id) || 0;
        commentCountMap.set(comment.article_id, count + 1);
      });

      articlesWithCommentCount = articles.map((article) => ({
        ...article,
        comment_count: commentCountMap.get(article.id) || 0,
      }));

      // 댓글순 정렬
      articlesWithCommentCount.sort((a: any, b: any) => {
        const aComments = a.comment_count || 0;
        const bComments = b.comment_count || 0;
        if (aComments !== bComments) return bComments - aComments;

        const aViews = a.view_count || 0;
        const bViews = b.view_count || 0;
        if (aViews !== bViews) return bViews - aViews;

        return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
      });
    }

    // 최대 조회수는 첫 번째 아이템에서 가져오기 (정렬된 상태)
    const maxViewCount = articlesWithCommentCount[0]?.view_count || 0;

    const totalPages = Math.ceil((count || 0) / limit);

    const response = NextResponse.json({
      success: true,
      articles: articlesWithCommentCount,
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
    console.error('아티클 조회 중 오류:', error);
    return NextResponse.json({ success: false, error: '아티클 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
