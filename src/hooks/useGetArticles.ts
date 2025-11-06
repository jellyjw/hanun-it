import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ArticlesResponse } from '@/types/articles';

interface UseGetArticlesParams {
  category?: string;
  isDomestic?: string;
  searchValue?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useGetArticles({
  category = 'domestic',
  isDomestic,
  searchValue = '',
  sort = 'latest',
  page = 1,
  limit = 20,
}: UseGetArticlesParams) {
  return useQuery<ArticlesResponse>({
    queryKey: ['articles', category, isDomestic, searchValue, sort, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (isDomestic !== undefined) params.append('domestic', isDomestic);
      if (searchValue) params.append('searchValue', searchValue);
      if (sort) params.append('sort', sort);
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/articles?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      return response.json();
    },
    placeholderData: keepPreviousData,
    staleTime: category === 'it-news' ? 2 * 60 * 1000 : 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000, // 30분
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
