import { useQuery } from '@tanstack/react-query';
import { ArticleResponse } from '@/types/articles';

export function useGetArticle(articleId: string) {
  return useQuery<ArticleResponse>({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${articleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
    refetchOnWindowFocus: false,
  });
}
