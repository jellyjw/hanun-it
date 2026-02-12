import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateNewsletterHtml } from '@/lib/newsletter-template';
import { NewsletterArticle } from '@/types/newsletter';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hanun-it.com';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request);

    // 로그인 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 날짜 설정
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 국내 새로운 아티클 3개 (최근 7일)
    const { data: newArticles } = await supabase
      .from('articles')
      .select('id, title, description, thumbnail, source_name, pub_date, view_count, link')
      .eq('is_domestic', true)
      .gte('pub_date', sevenDaysAgo.toISOString())
      .order('pub_date', { ascending: false })
      .limit(3);

    // 새 아티클 ID 목록 (중복 제거용)
    const newArticleIds = (newArticles || []).map((a) => a.id);

    // 국내 인기 아티클 (최근 30일, 새 아티클 제외)
    const { data: allPopular } = await supabase
      .from('articles')
      .select('id, title, description, thumbnail, source_name, pub_date, view_count, link')
      .eq('is_domestic', true)
      .gte('pub_date', thirtyDaysAgo.toISOString())
      .order('view_count', { ascending: false })
      .limit(10);

    // 새 아티클과 중복되지 않는 인기 아티클만 선택
    const popularArticles = (allPopular || [])
      .filter((a) => !newArticleIds.includes(a.id))
      .slice(0, 3);

    const newArticlesList: NewsletterArticle[] = (newArticles || []).map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description || '',
      thumbnail: a.thumbnail,
      source_name: a.source_name,
      pub_date: a.pub_date,
      view_count: a.view_count || 0,
      link: a.link,
    }));

    const popularArticlesList: NewsletterArticle[] = popularArticles.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description || '',
      thumbnail: a.thumbnail,
      source_name: a.source_name,
      pub_date: a.pub_date,
      view_count: a.view_count || 0,
      link: a.link,
    }));

    // 미리보기용 구독취소 URL
    const unsubscribeUrl = `${SITE_URL}/mypage`;

    const html = generateNewsletterHtml(
      newArticlesList,
      popularArticlesList,
      unsubscribeUrl
    );

    // HTML 직접 반환
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Newsletter preview error:', error);
    return NextResponse.json(
      { success: false, error: '미리보기 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
