import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ArticleSummarizer } from '@/lib/summarizer/summarizer';
import { checkIsAdmin } from '@/lib/admin';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient(request);

    // 관리자 확인
    const isAdmin = await checkIsAdmin(supabase);

    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401 });
    }

    const resolvedParams = await params;
    const articleId = resolvedParams.id;

    // OpenAI 키 확인
    const openaiKey = process.env.OPENAI_API_KEY || '';
    if (!openaiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 },
      );
    }

    // 아티클 가져오기
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, content, summary')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      return NextResponse.json(
        { success: false, error: 'Article not found', details: fetchError },
        { status: 404 },
      );
    }

    // 이미 요약이 있는 경우
    if (article.summary && article.summary.trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Summary already exists',
        summary: article.summary,
        regenerated: false,
      });
    }

    // 콘텐츠가 없는 경우
    if (!article.content || article.content.trim().length < 100) {
      return NextResponse.json(
        { success: false, error: 'Article content is too short or missing' },
        { status: 400 },
      );
    }

    // 요약 생성
    console.log(`🔄 Generating summary for article: ${article.title}`);
    const summarizer = new ArticleSummarizer(openaiKey);
    const summary = await summarizer.summarizeArticle(article.content, article.title);

    if (!summary) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate summary' },
        { status: 500 },
      );
    }

    // DB 업데이트
    const { error: updateError } = await supabase.from('articles').update({ summary }).eq('id', articleId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update article', details: updateError },
        { status: 500 },
      );
    }

    console.log(`✅ Summary generated successfully for: ${article.title}`);

    return NextResponse.json({
      success: true,
      message: 'Summary generated successfully',
      summary,
      regenerated: true,
    });
  } catch (error) {
    console.error('[API Error] /api/articles/[id]/generate-summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
