import { useMutation, useQueryClient } from '@tanstack/react-query';

interface LikeMutationParams {
  articleId: string;
  articleType: 'article' | 'it_news' | 'translated_article';
}

interface LikeResponse {
  success: boolean;
  liked: boolean;
  message: string;
}

export function useLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation<LikeResponse, Error, LikeMutationParams>({
    mutationFn: async ({ articleId, articleType }) => {
      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleType }),
      });

      if (!response.ok) {
        throw new Error('좋아요 처리에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // 좋아요 상태 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['likeStatus', variables.articleId, variables.articleType],
      });

      // 개별 아티클 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['article', variables.articleId],
      });

      // 아티클 목록 캐시 무효화 (좋아요 수 즉시 반영)
      queryClient.invalidateQueries({ queryKey: ['articles'] });

      if (variables.articleType === 'it_news') {
        queryClient.invalidateQueries({ queryKey: ['it-news'] });
      }
    },
  });
}
