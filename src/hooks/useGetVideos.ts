import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { YoutubeResponse } from '@/types/articles';

interface UseGetVideosParams {
  searchValue?: string;
  page?: number;
  limit?: number;
}

export function useGetVideos({
  searchValue = '',
  page = 1,
  limit = 20,
}: UseGetVideosParams) {
  return useQuery<YoutubeResponse>({
    queryKey: ['videos', searchValue, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchValue) params.append('searchValue', searchValue);
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/youtube?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      return response.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
    retry: 1,
    refetchOnWindowFocus: false,
  });
}