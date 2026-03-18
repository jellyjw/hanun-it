import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkIsAdmin } from '@/lib/admin';

async function verifyAdmin() {
  const supabase = await createClient();
  const isAdmin = await checkIsAdmin(supabase);
  if (!isAdmin) {
    return { authorized: false as const, supabase };
  }
  return { authorized: true as const, supabase };
}

export async function GET() {
  try {
    const { authorized, supabase } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const { data: sources, error } = await supabase
      .from('rss_sources')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      // Table might not exist yet - return RSS_SOURCES from constants as fallback
      const { RSS_SOURCES } = await import('@/utils/constants');
      return NextResponse.json({
        success: true,
        sources: RSS_SOURCES.map((s, i) => ({
          id: i + 1,
          name: s.name,
          url: s.url,
          category: s.category,
          is_domestic: s.isDomestic,
          is_active: true,
          last_fetched_at: null,
          article_count: 0,
        })),
        fromConstants: true,
      });
    }

    return NextResponse.json({ success: true, sources });
  } catch (error) {
    console.error('Admin sources GET error:', error);
    return NextResponse.json({ success: false, error: '소스 목록 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, supabase } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, url, category, is_domestic, is_active } = body;

    if (!name || !url) {
      return NextResponse.json({ success: false, error: '이름과 URL은 필수입니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('rss_sources')
      .insert({ name, url, category: category || 'tech', is_domestic: is_domestic ?? true, is_active: is_active ?? true })
      .select()
      .single();

    if (error) {
      console.error('Source insert error:', error);
      return NextResponse.json({ success: false, error: '소스 추가 실패' }, { status: 500 });
    }

    return NextResponse.json({ success: true, source: data });
  } catch (error) {
    console.error('Admin sources POST error:', error);
    return NextResponse.json({ success: false, error: '소스 추가 실패' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { authorized, supabase } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID는 필수입니다.' }, { status: 400 });
    }

    const { data, error } = await supabase.from('rss_sources').update(updates).eq('id', id).select().single();

    if (error) {
      console.error('Source update error:', error);
      return NextResponse.json({ success: false, error: '소스 수정 실패' }, { status: 500 });
    }

    return NextResponse.json({ success: true, source: data });
  } catch (error) {
    console.error('Admin sources PUT error:', error);
    return NextResponse.json({ success: false, error: '소스 수정 실패' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { authorized, supabase } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID는 필수입니다.' }, { status: 400 });
    }

    const { error } = await supabase.from('rss_sources').delete().eq('id', Number(id));

    if (error) {
      console.error('Source delete error:', error);
      return NextResponse.json({ success: false, error: '소스 삭제 실패' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin sources DELETE error:', error);
    return NextResponse.json({ success: false, error: '소스 삭제 실패' }, { status: 500 });
  }
}
