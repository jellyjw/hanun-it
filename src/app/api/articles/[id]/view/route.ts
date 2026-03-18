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
        supabase = await createClient(request);
      }
    } else {
      supabase = await createClient(request);
    }

    // 로그인한 사용자의 조회 기록 저장 (별도 클라이언트 사용)
    const authSupabase = await createClient(request);
    const { data: { user } } = await authSupabase.auth.getUser();

    // 테이블 순서대로 조회수 증가 시도 (원자적 업데이트)
    const tables = ['articles', 'it_news'] as const;
    const typeMap = { articles: 'article', it_news: 'it-news' } as const;

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id, view_count')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        // view_count를 원자적으로 증가 (race condition 방지)
        const { error: updateError } = await supabase.rpc('increment_view_count', {
          p_table_name: table,
          p_article_id: id,
        });

        // RPC가 없으면 기존 방식으로 fallback
        if (updateError) {
          await supabase
            .from(table)
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', id);
        }

        // 로그인한 사용자의 조회 기록 저장
        if (user) {
          const articleType = table === 'articles' ? 'article' : 'it_news';
          await authSupabase.rpc('upsert_article_view', {
            p_user_id: user.id,
            p_article_id: id,
            p_article_type: articleType,
          }).then(({ error: rpcError }) => {
            if (rpcError) console.error('조회 기록 저장 실패:', rpcError);
          });

          // 추천 시스템용 읽기 기록 저장
          const { data: existingHistory } = await authSupabase
            .from('user_reading_history')
            .select('id')
            .eq('user_id', user.id)
            .eq('article_id', id)
            .maybeSingle();

          if (existingHistory) {
            await authSupabase
              .from('user_reading_history')
              .update({ read_at: new Date().toISOString() })
              .eq('id', existingHistory.id);
          } else {
            await authSupabase
              .from('user_reading_history')
              .insert({
                user_id: user.id,
                article_id: id,
                article_type: articleType,
              })
              .then(({ error: historyError }) => {
                if (historyError) console.error('읽기 기록 저장 실패:', historyError);
              });
          }
        }

        return NextResponse.json({
          success: true,
          view_count: (data.view_count || 0) + 1,
          type: typeMap[table],
        });
      }
    }

    return NextResponse.json({ success: false, error: '아티클을 찾을 수 없습니다.' }, { status: 404 });
  } catch (error) {
    console.error('조회수 증가 중 오류:', error);
    return NextResponse.json({ success: false, error: '조회수 증가 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
