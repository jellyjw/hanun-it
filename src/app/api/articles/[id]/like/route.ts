import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const supabase = await createClient(request);

    // 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { articleType = 'article' } = await request.json();

    // 이미 좋아요를 눌렀는지 확인
    const { data: existingLike } = await supabase
      .from('article_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('article_id', id)
      .eq('article_type', articleType)
      .single();

    if (existingLike) {
      // 좋아요 취소
      const { error: deleteError } = await supabase
        .from('article_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', id)
        .eq('article_type', articleType);

      if (deleteError) {
        console.error('좋아요 취소 실패:', deleteError);
        return NextResponse.json({ success: false, error: '좋아요 취소에 실패했습니다.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        liked: false,
        message: '좋아요가 취소되었습니다.',
      });
    } else {
      // 좋아요 추가
      const { error: insertError } = await supabase.from('article_likes').insert({
        user_id: user.id,
        article_id: id,
        article_type: articleType,
      });

      if (insertError) {
        console.error('좋아요 추가 실패:', insertError);
        return NextResponse.json({ success: false, error: '좋아요 추가에 실패했습니다.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        liked: true,
        message: '좋아요가 추가되었습니다.',
      });
    }
  } catch (error) {
    console.error('좋아요 처리 중 오류:', error);
    return NextResponse.json({ success: false, error: '좋아요 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const supabase = await createClient(request);

    // 사용자 인증 확인 (로그인하지 않은 사용자도 좋아요 수는 조회 가능)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const articleType = searchParams.get('type') || 'article';

    // 로그인한 사용자의 경우 좋아요 상태 확인
    let liked = false;
    if (user) {
      const { data: like } = await supabase
        .from('article_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', id)
        .eq('article_type', articleType)
        .single();

      liked = !!like;
    }

    // 아티클의 좋아요 수 조회 (로그인 여부와 관계없이)
    let likeCount = 0;
    if (articleType === 'article') {
      const { data: article } = await supabase.from('articles').select('like_count').eq('id', id).single();
      likeCount = article?.like_count || 0;
    } else if (articleType === 'it_news') {
      const { data: itNews } = await supabase.from('it_news').select('like_count').eq('id', id).single();
      likeCount = itNews?.like_count || 0;
    } else if (articleType === 'translated_article') {
      const { data: translatedArticle } = await supabase
        .from('translated_articles')
        .select('like_count')
        .eq('id', id)
        .single();
      likeCount = translatedArticle?.like_count || 0;
    }

    return NextResponse.json({
      success: true,
      liked,
      likeCount,
    });
  } catch (error) {
    console.error('좋아요 상태 조회 중 오류:', error);
    return NextResponse.json({ success: false, error: '좋아요 상태 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
