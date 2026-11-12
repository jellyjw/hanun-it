import { useQuery } from '@tanstack/react-query';
import { Article, ArticleResponse } from '@/types/articles';

export function useGetArticle(articleId: string, initialArticle?: Article | null) {
  return useQuery<ArticleResponse>({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${articleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      return response.json();
    },
    // 서버 컴포넌트에서 이미 조회한 아티클을 초기 데이터로 주입해 상세 진입 시
    // 스켈레톤 없이 즉시 렌더한다(이중 패칭 제거).
    // initialDataUpdatedAt을 0으로 두어 "오래된 데이터"로 표시하면, 화면은 즉시 그리면서도
    // 백그라운드에서 조용히 재검증해 type(it-news/translated) 등 서버 전용 필드를 최신화한다.
    initialData: initialArticle
      ? {
          success: true,
          article: initialArticle,
          type: (initialArticle.category as string) === 'it-news' ? 'it-news' : 'article',
        }
      : undefined,
    initialDataUpdatedAt: initialArticle ? 0 : undefined,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
  });
}
