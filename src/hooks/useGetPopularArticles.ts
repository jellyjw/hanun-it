import { useQuery } from '@tanstack/react-query';
import { Article } from '@/types/articles';

interface PopularArticlesResponse {
  success: boolean;
  articles: (Article & { score: number })[];
  updatedAt: string;
}

export function useGetPopularArticles() {
  return useQuery<PopularArticlesResponse>({
    queryKey: ['popular-articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles/popular');
      if (!response.ok) {
        throw new Error('Failed to fetch popular articles');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
