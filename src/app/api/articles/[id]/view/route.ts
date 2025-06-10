import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 현재 조회수 가져오기
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('view_count')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('아티클 조회 실패:', fetchError);
      return NextResponse.json({ success: false, error: '아티클을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 조회수 증가
    const newViewCount = (article.view_count || 0) + 1;

    const { error: updateError } = await supabase.from('articles').update({ view_count: newViewCount }).eq('id', id);

    if (updateError) {
      console.error('조회수 업데이트 실패:', updateError);
      return NextResponse.json({ success: false, error: '조회수 업데이트에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      view_count: newViewCount,
    });
  } catch (error) {
    console.error('조회수 증가 중 오류:', error);
    return NextResponse.json({ success: false, error: '조회수 증가 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
