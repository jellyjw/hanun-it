import { SupabaseClient } from '@supabase/supabase-js';

interface ReadingHistoryItem {
  article_id: string;
  article_type: string;
  read_at: string;
}

interface ArticleData {
  id: string;
  title: string;
  description: string;
  source_name: string;
  category: string;
  is_domestic: boolean;
  pub_date: string;
  thumbnail: string;
  view_count: number;
  like_count: number;
}

interface ScoredArticle extends ArticleData {
  score: number;
}

export async function getRecommendations(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 10,
): Promise<ScoredArticle[]> {
  // 1. 최근 50개 읽기 기록 가져오기
  const { data: history, error: historyError } = await supabase
    .from('user_reading_history')
    .select('article_id, article_type, read_at')
    .eq('user_id', userId)
    .order('read_at', { ascending: false })
    .limit(50);

  if (historyError || !history || history.length === 0) {
    return [];
  }

  const typedHistory = history as ReadingHistoryItem[];

  // 2. 읽은 아티클의 상세 정보 가져오기 (카테고리, 소스 분석용)
  const articleIds = typedHistory
    .filter((h) => h.article_type === 'article')
    .map((h) => h.article_id);
  const itNewsIds = typedHistory
    .filter((h) => h.article_type === 'it_news')
    .map((h) => h.article_id);

  const readArticles: ArticleData[] = [];

  if (articleIds.length > 0) {
    const { data } = await supabase
      .from('articles')
      .select('id, title, description, source_name, category, is_domestic, pub_date, thumbnail, view_count, like_count')
      .in('id', articleIds);
    if (data) readArticles.push(...(data as ArticleData[]));
  }

  if (itNewsIds.length > 0) {
    const { data } = await supabase
      .from('it_news')
      .select('id, title, description, source_name, category, is_domestic, pub_date, thumbnail, view_count, like_count')
      .in('id', itNewsIds);
    if (data) readArticles.push(...(data as ArticleData[]));
  }

  if (readArticles.length === 0) {
    return [];
  }

  // 3. 카테고리 및 소스별 가중치 계산
  const categoryWeights = new Map<string, number>();
  const sourceWeights = new Map<string, number>();
  const domesticWeight = { domestic: 0, foreign: 0 };

  for (const article of readArticles) {
    const cat = article.category || 'unknown';
    categoryWeights.set(cat, (categoryWeights.get(cat) || 0) + 1);

    const source = article.source_name || 'unknown';
    sourceWeights.set(source, (sourceWeights.get(source) || 0) + 1);

    if (article.is_domestic) {
      domesticWeight.domestic += 1;
    } else {
      domesticWeight.foreign += 1;
    }
  }

  // 가중치 정규화
  const totalRead = readArticles.length;
  for (const [key, value] of categoryWeights) {
    categoryWeights.set(key, value / totalRead);
  }
  for (const [key, value] of sourceWeights) {
    sourceWeights.set(key, value / totalRead);
  }

  // 4. 읽지 않은 아티클 가져오기 (최근 30일)
  const readArticleIdSet = new Set(typedHistory.map((h) => h.article_id));
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [articlesResult, itNewsResult] = await Promise.all([
    supabase
      .from('articles')
      .select('id, title, description, source_name, category, is_domestic, pub_date, thumbnail, view_count, like_count')
      .gte('pub_date', thirtyDaysAgo.toISOString())
      .order('pub_date', { ascending: false })
      .limit(200),
    supabase
      .from('it_news')
      .select('id, title, description, source_name, category, is_domestic, pub_date, thumbnail, view_count, like_count')
      .gte('pub_date', thirtyDaysAgo.toISOString())
      .order('pub_date', { ascending: false })
      .limit(200),
  ]);

  const candidates: ArticleData[] = [];
  if (articlesResult.data) {
    candidates.push(
      ...(articlesResult.data as ArticleData[]).filter((a) => !readArticleIdSet.has(a.id)),
    );
  }
  if (itNewsResult.data) {
    candidates.push(
      ...(itNewsResult.data as ArticleData[]).filter((a) => !readArticleIdSet.has(a.id)),
    );
  }

  if (candidates.length === 0) {
    return [];
  }

  // 5. 후보 아티클 스코어링
  const scored: ScoredArticle[] = candidates.map((article) => {
    let score = 0;

    // 카테고리 매칭 (가중치 40%)
    const catWeight = categoryWeights.get(article.category || 'unknown') || 0;
    score += catWeight * 40;

    // 소스 매칭 (가중치 30%)
    const srcWeight = sourceWeights.get(article.source_name || 'unknown') || 0;
    score += srcWeight * 30;

    // 국내/해외 선호 (가중치 10%)
    const totalDomestic = domesticWeight.domestic + domesticWeight.foreign;
    if (totalDomestic > 0) {
      const domesticPref = article.is_domestic
        ? domesticWeight.domestic / totalDomestic
        : domesticWeight.foreign / totalDomestic;
      score += domesticPref * 10;
    }

    // 인기도 보정 (가중치 10%)
    const popularity = (article.view_count || 0) + (article.like_count || 0) * 5;
    score += Math.min(popularity / 100, 1) * 10;

    // 최신성 보정 (가중치 10%)
    const daysSincePublish =
      (Date.now() - new Date(article.pub_date).getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - daysSincePublish / 30);
    score += recencyScore * 10;

    return { ...article, score };
  });

  // 6. 점수순 정렬 후 상위 N개 반환
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
