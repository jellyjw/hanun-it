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
    let supabase = await createClient(); // 기본값으로 일반 클라이언트 초기화
    const hasServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasServiceKey) {
      try {
        supabase = createServiceRoleClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
      } catch (error) {
        console.error('서비스 클라이언트 생성 실패, 일반 클라이언트 사용:', error);
        // 이미 일반 클라이언트로 초기화되어 있으므로 추가 작업 불필요
      }
    }

    // 3개 테이블 병렬 조회
    const [articleResult, itNewsResult, translatedResult] = await Promise.allSettled([
      supabase.from('articles').select('*').eq('id', id).single(),
      supabase.from('it_news').select('*').eq('id', id).single(),
      supabase.from('translated_articles').select('*').eq('id', id).single(),
    ]);

    // 1. articles 테이블 결과 확인
    if (articleResult.status === 'fulfilled' && articleResult.value.data) {
      return NextResponse.json({
        success: true,
        article: articleResult.value.data,
        type: 'article',
      });
    }

    // 2. it_news 테이블 결과 확인
    if (itNewsResult.status === 'fulfilled' && itNewsResult.value.data) {
      return NextResponse.json({
        success: true,
        article: {
          ...itNewsResult.value.data,
          is_domestic: true,
        },
        type: 'it-news',
      });
    }

    // 3. translated_articles 테이블 결과 확인
    if (translatedResult.status === 'fulfilled' && translatedResult.value.data) {
      return NextResponse.json({
        success: true,
        article: {
          ...translatedResult.value.data,
          is_domestic: false,
          is_translated: true,
        },
        type: 'translated',
      });
    }

    return NextResponse.json({ success: false, error: '아티클을 찾을 수 없습니다.' }, { status: 404 });
  } catch (error) {
    console.error('아티클 조회 중 오류:', error);
    return NextResponse.json({ success: false, error: '아티클 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
