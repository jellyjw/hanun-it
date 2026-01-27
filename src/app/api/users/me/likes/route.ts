import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MyPageArticle, LikedArticlesResponse } from '@/types/user';

// GET - 사용자가 좋아요한 아티클 목록
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 좋아요한 아티클 ID 목록 조회
    const { data: likes, error: likesError } = await supabase
      .from('article_likes')
      .select('article_id, article_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (likesError) {
      console.error('좋아요 목록 조회 오류:', likesError);
      return NextResponse.json({ success: false, error: '좋아요 목록을 불러오는데 실패했습니다.' }, { status: 500 });
    }

    // 전체 좋아요 수 조회
    const { count, error: countError } = await supabase
      .from('article_likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('좋아요 수 조회 오류:', countError);
    }

    // 각 아티클의 상세 정보 조회
    const articles: MyPageArticle[] = [];

    for (const like of likes || []) {
      let articleData = null;

      if (like.article_type === 'article') {
        const { data } = await supabase
          .from('articles')
          .select('id, title, description, thumbnail, source_name, pub_date, view_count, like_count')
          .eq('id', like.article_id)
          .single();
        articleData = data;
      } else if (like.article_type === 'it_news') {
        const { data } = await supabase
          .from('it_news')
          .select('id, title, description, thumbnail, source_name, pub_date, view_count, like_count')
          .eq('id', like.article_id)
          .single();
        articleData = data;
      } else if (like.article_type === 'translated_article') {
        const { data } = await supabase
          .from('translated_articles')
          .select('id, title, description, thumbnail, source_name, pub_date, view_count, like_count')
          .eq('id', like.article_id)
          .single();
        articleData = data;
      }

      if (articleData) {
        articles.push({
          id: articleData.id,
          title: articleData.title,
          description: articleData.description || '',
          thumbnail: articleData.thumbnail || null,
          sourceName: articleData.source_name || '',
          pubDate: articleData.pub_date,
          viewCount: articleData.view_count || 0,
          likeCount: articleData.like_count || 0,
          articleType: like.article_type as 'article' | 'it_news' | 'translated_article',
          actionAt: like.created_at,
        });
      }
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const response: LikedArticlesResponse = {
      success: true,
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('좋아요한 글 목록 조회 오류:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
