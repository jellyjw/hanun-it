import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceRoleClient } from '@supabase/supabase-js';

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
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

    // 1. 먼저 일반 articles 테이블에서 조회
    const { data: article, error } = await supabase.from('articles').select('*').eq('id', id).single();

    if (article) {
      // 국내 아티클은 그대로 반환
      return NextResponse.json({
        success: true,
        article,
        type: 'article',
      });
    }

    // 2. articles 테이블에 없으면 it_news 테이블에서 조회
    const { data: itNews, error: itNewsError } = await supabase.from('it_news').select('*').eq('id', id).single();

    if (itNews) {
      // IT 뉴스는 is_domestic을 true로 설정하여 반환
      return NextResponse.json({
        success: true,
        article: {
          ...itNews,
          is_domestic: true,
        },
        type: 'it-news',
      });
    }

    // 3. it_news 테이블에도 없으면 translated_articles 테이블에서 직접 조회
    const { data: translatedArticle, error: translatedError } = await supabase
      .from('translated_articles')
      .select('*')
      .eq('id', id)
      .single();

    if (translatedError || !translatedArticle) {
      return NextResponse.json({ success: false, error: '아티클을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      article: {
        ...translatedArticle,
        is_domestic: false,
        is_translated: true,
      },
      type: 'translated',
    });
  } catch (error) {
    console.error('아티클 조회 중 오류:', error);
    return NextResponse.json({ success: false, error: '아티클 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
