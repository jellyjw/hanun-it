import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseArticleActionsParams {
  // 수집 완료 후 목록을 갱신하기 위한 refetch 콜백
  refetch: () => void;
}

/**
 * 아티클/뉴스 RSS 수집, 썸네일 추출 등 운영(관리자)용 액션 모음.
 * 목록 페이지 컨테이너에서 UI 로직과 분리하기 위해 훅으로 추출했다.
 */
export function useArticleActions({ refetch }: UseArticleActionsParams) {
  const { toast } = useToast();

  const handleRefreshRSS = useCallback(async () => {
    try {
      const response = await fetch('/api/rss');
      const result = await response.json();
      if (result.success) {
        toast({
          title: `${result.articles}개의 새로운 아티클을 수집했습니다. (썸네일 ${result.thumbnailsExtracted || 0}개 추출)`,
          variant: 'success',
        });
        refetch();
      }
    } catch {
      toast({
        title: 'RSS 수집 중 오류가 발생했습니다.',
        variant: 'error',
      });
    }
  }, [toast, refetch]);

  const handleRefreshITNews = useCallback(async () => {
    try {
      const response = await fetch('/api/it-news/rss');
      const result = await response.json();
      if (result.success) {
        toast({
          title: `${result.articles}개의 새로운 IT 뉴스를 수집했습니다. (썸네일 ${result.thumbnailsExtracted || 0}개 추출)`,
          variant: 'success',
        });
        refetch();
      }
    } catch {
      toast({
        title: 'IT 뉴스 RSS 수집 중 오류가 발생했습니다.',
        variant: 'error',
      });
    }
  }, [toast, refetch]);

  const handleExtractThumbnails = useCallback(async () => {
    try {
      toast({
        title: '기존 아티클의 썸네일을 추출하고 있습니다...',
        variant: 'default',
      });

      const response = await fetch('/api/articles/extract-thumbnails', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        toast({
          title: `${result.processed}개 아티클 중 ${result.extracted}개의 썸네일을 추출했습니다.`,
          variant: 'success',
        });
        refetch();
      } else {
        toast({
          title: result.error || '썸네일 추출 중 오류가 발생했습니다.',
          variant: 'error',
        });
      }
    } catch {
      toast({
        title: '썸네일 추출 중 오류가 발생했습니다.',
        variant: 'error',
      });
    }
  }, [toast, refetch]);

  return { handleRefreshRSS, handleRefreshITNews, handleExtractThumbnails };
}
