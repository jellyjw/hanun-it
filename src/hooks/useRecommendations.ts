import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

interface RecommendedArticle {
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
  score: number;
}

interface RecommendationsResponse {
  success: boolean;
  articles: RecommendedArticle[];
}

export function useRecommendations(limit: number = 10) {
  const { user, loading } = useAuth();

  return useQuery<RecommendationsResponse>({
    queryKey: ['recommendations', limit],
    queryFn: async () => {
      const response = await fetch(`/api/recommendations?limit=${limit}`);
      if (!response.ok) {
        throw new Error('추천 아티클을 불러오는데 실패했습니다.');
      }
      return response.json();
    },
    enabled: !loading && !!user,
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
