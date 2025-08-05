import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

interface LikeStatus {
  liked: boolean;
  likeCount: number;
}

interface UseLikeStatusProps {
  articleId: string;
  articleType?: 'article' | 'it_news' | 'translated_article';
  enabled?: boolean;
}

export function useLikeStatus({ articleId, articleType = 'article', enabled = true }: UseLikeStatusProps) {
  const { user } = useAuth();

  return useQuery<LikeStatus>({
    queryKey: ['likeStatus', articleId, articleType],
    queryFn: async () => {
      // 로그인 여부와 관계없이 API 호출 (좋아요 수는 조회 가능)
      const response = await fetch(`/api/articles/${articleId}/like?type=${articleType}`);
      if (!response.ok) {
        throw new Error('좋아요 상태 조회에 실패했습니다.');
      }
      return response.json();
    },
    enabled: enabled,
    staleTime: 1000 * 60 * 30, // 30분으로 증가
    gcTime: 1000 * 60 * 60, // 1시간으로 증가
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 방지
    refetchOnMount: true, // 컴포넌트 마운트 시 항상 조회
  });
}
