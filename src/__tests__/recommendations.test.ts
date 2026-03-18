import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecommendations } from '@/lib/recommendations/content-based';

// Helper to create mock article data
function mockArticle(overrides: Record<string, unknown> = {}) {
  return {
    id: 'art-1',
    title: 'Test Article',
    description: 'Description',
    source_name: 'toss',
    category: 'frontend',
    is_domestic: true,
    pub_date: new Date().toISOString(),
    thumbnail: 'thumb.jpg',
    view_count: 10,
    like_count: 2,
    ...overrides,
  };
}

// Helper to create a mock Supabase client
function createMockSupabase({
  history = [] as Array<{ article_id: string; article_type: string; read_at: string }>,
  articles = [] as Array<Record<string, unknown>>,
  itNews = [] as Array<Record<string, unknown>>,
  candidateArticles = [] as Array<Record<string, unknown>>,
  candidateItNews = [] as Array<Record<string, unknown>>,
} = {}) {
  const mockFrom = vi.fn();
  const supabase = { from: mockFrom, auth: { getUser: vi.fn() } };

  // Track call index to distinguish between read-article lookups and candidate fetches
  let fromCallCount = 0;

  mockFrom.mockImplementation((table: string) => {
    fromCallCount++;
    if (table === 'user_reading_history') {
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: history, error: null }),
            }),
          }),
        }),
      };
    }

    if (table === 'articles') {
      // First call for articles table = reading history lookup, later calls = candidates
      const isHistoryLookup = fromCallCount <= 3; // history + articles lookup + it_news lookup
      const data = isHistoryLookup ? articles : candidateArticles;
      return {
        select: () => ({
          in: () => Promise.resolve({ data, error: null }),
          gte: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: candidateArticles, error: null }),
            }),
          }),
        }),
      };
    }

    if (table === 'it_news') {
      const isHistoryLookup = fromCallCount <= 3;
      const data = isHistoryLookup ? itNews : candidateItNews;
      return {
        select: () => ({
          in: () => Promise.resolve({ data, error: null }),
          gte: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: candidateItNews, error: null }),
            }),
          }),
        }),
      };
    }

    return {
      select: () => ({
        in: () => Promise.resolve({ data: [], error: null }),
        gte: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
    };
  });

  return supabase;
}

describe('getRecommendations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty array when user has no reading history', async () => {
    const supabase = createMockSupabase({ history: [] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getRecommendations(supabase as any, 'user-1');
    expect(result).toEqual([]);
  });

  it('returns empty array when history error occurs', async () => {
    const mockFrom = vi.fn().mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: null, error: { message: 'DB error' } }),
          }),
        }),
      }),
    }));
    const supabase = { from: mockFrom, auth: { getUser: vi.fn() } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getRecommendations(supabase as any, 'user-1');
    expect(result).toEqual([]);
  });

  it('returns empty array when read articles cannot be fetched', async () => {
    const supabase = createMockSupabase({
      history: [
        { article_id: 'art-1', article_type: 'article', read_at: new Date().toISOString() },
      ],
      articles: [], // No articles found
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getRecommendations(supabase as any, 'user-1');
    expect(result).toEqual([]);
  });

  it('scores candidates higher when they match user category preference', async () => {
    const now = new Date().toISOString();
    const readArticle = mockArticle({ id: 'read-1', category: 'frontend', source_name: 'toss' });

    const candidateMatching = mockArticle({
      id: 'cand-1',
      category: 'frontend', // matches preference
      source_name: 'other',
      pub_date: now,
    });
    const candidateNonMatching = mockArticle({
      id: 'cand-2',
      category: 'backend', // does not match
      source_name: 'other',
      pub_date: now,
      view_count: 10,
      like_count: 2,
    });

    const supabase = createMockSupabase({
      history: [{ article_id: 'read-1', article_type: 'article', read_at: now }],
      articles: [readArticle],
      candidateArticles: [candidateMatching, candidateNonMatching],
      candidateItNews: [],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getRecommendations(supabase as any, 'user-1');
    expect(result.length).toBeGreaterThan(0);

    const matchingScore = result.find((r) => r.id === 'cand-1')?.score ?? 0;
    const nonMatchingScore = result.find((r) => r.id === 'cand-2')?.score ?? 0;
    expect(matchingScore).toBeGreaterThan(nonMatchingScore);
  });

  it('scores candidates higher when they match user source preference', async () => {
    const now = new Date().toISOString();
    const readArticle = mockArticle({ id: 'read-1', category: 'general', source_name: 'toss' });

    const candidateMatchSource = mockArticle({
      id: 'cand-1',
      category: 'other',
      source_name: 'toss', // matches
      pub_date: now,
      view_count: 0,
      like_count: 0,
    });
    const candidateNoMatch = mockArticle({
      id: 'cand-2',
      category: 'other',
      source_name: 'unknown-source',
      pub_date: now,
      view_count: 0,
      like_count: 0,
    });

    const supabase = createMockSupabase({
      history: [{ article_id: 'read-1', article_type: 'article', read_at: now }],
      articles: [readArticle],
      candidateArticles: [candidateMatchSource, candidateNoMatch],
      candidateItNews: [],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getRecommendations(supabase as any, 'user-1');
    const matchScore = result.find((r) => r.id === 'cand-1')?.score ?? 0;
    const noMatchScore = result.find((r) => r.id === 'cand-2')?.score ?? 0;
    expect(matchScore).toBeGreaterThan(noMatchScore);
  });

  it('respects the limit parameter', async () => {
    const now = new Date().toISOString();
    const readArticle = mockArticle({ id: 'read-1' });
    const candidates = Array.from({ length: 20 }, (_, i) =>
      mockArticle({ id: `cand-${i}`, pub_date: now }),
    );

    const supabase = createMockSupabase({
      history: [{ article_id: 'read-1', article_type: 'article', read_at: now }],
      articles: [readArticle],
      candidateArticles: candidates,
      candidateItNews: [],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getRecommendations(supabase as any, 'user-1', 5);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('excludes already-read articles from candidates', async () => {
    const now = new Date().toISOString();
    const readArticle = mockArticle({ id: 'read-1' });

    // Candidate list includes the already-read article
    const candidates = [
      mockArticle({ id: 'read-1', pub_date: now }), // should be excluded
      mockArticle({ id: 'new-1', pub_date: now }),
    ];

    const supabase = createMockSupabase({
      history: [{ article_id: 'read-1', article_type: 'article', read_at: now }],
      articles: [readArticle],
      candidateArticles: candidates,
      candidateItNews: [],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getRecommendations(supabase as any, 'user-1');
    const ids = result.map((r) => r.id);
    expect(ids).not.toContain('read-1');
  });

  it('gives higher score to more popular articles', async () => {
    const now = new Date().toISOString();
    const readArticle = mockArticle({ id: 'read-1', category: 'x', source_name: 'y' });

    const popularCandidate = mockArticle({
      id: 'popular',
      category: 'other',
      source_name: 'other',
      view_count: 500,
      like_count: 100,
      pub_date: now,
      is_domestic: true,
    });
    const unpopularCandidate = mockArticle({
      id: 'unpopular',
      category: 'other',
      source_name: 'other',
      view_count: 0,
      like_count: 0,
      pub_date: now,
      is_domestic: true,
    });

    const supabase = createMockSupabase({
      history: [{ article_id: 'read-1', article_type: 'article', read_at: now }],
      articles: [readArticle],
      candidateArticles: [popularCandidate, unpopularCandidate],
      candidateItNews: [],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getRecommendations(supabase as any, 'user-1');
    const popScore = result.find((r) => r.id === 'popular')?.score ?? 0;
    const unpopScore = result.find((r) => r.id === 'unpopular')?.score ?? 0;
    expect(popScore).toBeGreaterThan(unpopScore);
  });

  it('returns results sorted by score descending', async () => {
    const now = new Date().toISOString();
    const readArticle = mockArticle({ id: 'read-1' });
    const candidates = Array.from({ length: 10 }, (_, i) =>
      mockArticle({
        id: `cand-${i}`,
        pub_date: now,
        view_count: i * 50,
        like_count: i * 10,
      }),
    );

    const supabase = createMockSupabase({
      history: [{ article_id: 'read-1', article_type: 'article', read_at: now }],
      articles: [readArticle],
      candidateArticles: candidates,
      candidateItNews: [],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getRecommendations(supabase as any, 'user-1');
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
    }
  });
});
