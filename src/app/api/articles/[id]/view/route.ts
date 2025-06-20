import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceRoleClient } from '@supabase/supabase-js';

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

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
        console.error('서비스 클라이언트 생성 실패, 일반 클라이언트 사용:', error);
        supabase = await createClient();
      }
    } else {
      supabase = await createClient();
    }

    // 1. 먼저 articles 테이블에서 조회수 가져오기
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('view_count')
      .eq('id', id)
      .single();

    if (article) {
      // articles 테이블에 있는 경우 조회수 증가
      const newViewCount = (article.view_count || 0) + 1;

      const { error: updateError } = await supabase.from('articles').update({ view_count: newViewCount }).eq('id', id);

      if (updateError) {
        console.error('articles 조회수 업데이트 실패:', updateError);
        return NextResponse.json({ success: false, error: '조회수 업데이트에 실패했습니다.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        view_count: newViewCount,
        type: 'article',
      });
    }

    // 2. articles 테이블에 없으면 it_news 테이블에서 조회
    const { data: itNews, error: itNewsFetchError } = await supabase
      .from('it_news')
      .select('view_count')
      .eq('id', id)
      .single();

    if (itNews) {
      // it_news 테이블에 있는 경우 조회수 증가
      const newViewCount = (itNews.view_count || 0) + 1;

      const { error: updateError } = await supabase.from('it_news').update({ view_count: newViewCount }).eq('id', id);

      if (updateError) {
        console.error('it_news 조회수 업데이트 실패:', updateError);
        return NextResponse.json({ success: false, error: '조회수 업데이트에 실패했습니다.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        view_count: newViewCount,
        type: 'it-news',
      });
    }

    // 3. 두 테이블 모두에 없는 경우
    console.error('아티클/IT뉴스 조회 실패:', { fetchError, itNewsFetchError });
    return NextResponse.json({ success: false, error: '아티클을 찾을 수 없습니다.' }, { status: 404 });
  } catch (error) {
    console.error('조회수 증가 중 오류:', error);
    return NextResponse.json({ success: false, error: '조회수 증가 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
