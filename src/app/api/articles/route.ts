import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isDomestic = searchParams.get('domestic');
    const searchValue = searchParams.get('searchValue');
    const sort = searchParams.get('sort') || 'popular'; // popular, latest, comments
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
      } else if (category === 'it-news') {
        // IT 뉴스의 경우 it_news 테이블에서 조회하므로 별도 처리
        const response = await fetch(`${request.url.replace('/api/articles', '/api/it-news')}`);
        return response;
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
      } else if (category === 'it-news') {
        // IT 뉴스는 이미 위에서 처리됨
        return NextResponse.json({ success: false, error: 'IT 뉴스는 별도 API에서 처리됩니다.' }, { status: 400 });
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
      } else if (category === 'it-news') {
        // IT 뉴스는 이미 위에서 처리됨
        return NextResponse.json({ success: false, error: 'IT 뉴스는 별도 API에서 처리됩니다.' }, { status: 400 });
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

    // 댓글 수 조회 (댓글순 정렬을 위해)
    let articlesWithCommentCount = articles || [];

    if (sort === 'comments') {
      // 모든 아티클의 댓글 수를 조회
      const articleIds = (articles || []).map((article) => article.id);

      if (articleIds.length > 0) {
        const { data: commentCounts } = await supabase
          .from('comments')
          .select('article_id')
          .in('article_id', articleIds);

        // 댓글 수를 계산하여 아티클에 추가
        const commentCountMap = new Map();
        (commentCounts || []).forEach((comment) => {
          const count = commentCountMap.get(comment.article_id) || 0;
          commentCountMap.set(comment.article_id, count + 1);
        });

        articlesWithCommentCount = (articles || []).map((article) => ({
          ...article,
          comment_count: commentCountMap.get(article.id) || 0,
        }));
      }
    }

    // 정렬 로직
    let sortedArticles;

    if (sort === 'latest') {
      // 최신순: 발행일 기준
      sortedArticles = articlesWithCommentCount.sort((a, b) => {
        return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
      });
    } else if (sort === 'comments') {
      // 댓글순: 댓글 수 > 조회수 > 최신순
      sortedArticles = articlesWithCommentCount.sort((a, b) => {
        const aComments = a.comment_count || 0;
        const bComments = b.comment_count || 0;

        if (aComments !== bComments) return bComments - aComments;

        const aViews = a.view_count || 0;
        const bViews = b.view_count || 0;

        if (aViews !== bViews) return bViews - aViews;

        return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
      });
    } else {
      // 인기순 (기본값): 썸네일 유무 > 조회수 > 최신순 또는 주간 인기 로직
      if (category === 'weekly') {
        // 주간 인기는 조회수 우선
        sortedArticles = articlesWithCommentCount.sort((a, b) => {
          const aViews = a.view_count || 0;
          const bViews = b.view_count || 0;

          if (aViews !== bViews) return bViews - aViews;

          return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
        });
      } else {
        // 다른 카테고리들은 썸네일 유무 > 조회수 > 최신순으로 정렬
        sortedArticles = articlesWithCommentCount.sort((a, b) => {
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
      sort,
      maxViewCount, // HOT 뱃지 판단을 위한 최대 조회수 추가
    });
  } catch (error) {
    console.error('아티클 조회 중 오류:', error);
    return NextResponse.json({ success: false, error: '아티클 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
