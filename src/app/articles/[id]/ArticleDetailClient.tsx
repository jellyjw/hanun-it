'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { ExternalLink, Eye } from 'lucide-react';
import CommentSection from '@/components/comments/CommentSection';
import { marked } from 'marked';
import { processArticleContent, detectContentType } from '@/utils/markdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArticleSkeleton } from '@/components/skeleton/ArticleSkeleton';
import LikeButton from '@/components/articles/LikeButton';
import ShareButton from '@/components/articles/ShareButton';
import { useLikeStatus } from '@/hooks/useLikeStatus';
import { useGetArticle } from '@/hooks/useGetArticle';
import { Header } from '@/components/header/Header';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/ui/BackButton';
import ScrollNavigation from '@/components/ui/ScrollNavigation';
import InArticleAd from '@/components/ads/InArticleAd';
import { useAuth } from '@/hooks/useAuth';

interface ArticleDetailClientProps {
  articleId: string;
  initialArticle: any;
}

export default function ArticleDetailClient({ articleId, initialArticle }: ArticleDetailClientProps) {
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useGetArticle(articleId);

  const incrementViewMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/articles/${id}/view`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to increment view count');
      return response.json();
    },
  });

  const backfillMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/articles/backfill-content', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to backfill content');
      return response.json();
    },
    onSuccess: (data) => {
      alert(data.message);
      refetch();
    },
    onError: (error) => {
      alert(`마이그레이션 실패: ${error.message}`);
    },
  });

  const article = data?.article || initialArticle;
  const articleType = article?.type === 'it-news' ? 'it_news' : 'article';

  const { data: likeStatus } = useLikeStatus({
    articleId,
    articleType,
    enabled: !!article,
  });

  useEffect(() => {
    if (article) {
      incrementViewMutation.mutate(articleId);
    }
  }, [article, articleId]);

  const processedContent = useMemo(() => {
    if (!article?.content) return '';

    const contentType = detectContentType(article.content);
    if (contentType === 'markdown') {
      return processArticleContent(article.content);
    }

    return article.content;
  }, [article?.content]);

  const handleBackfill = () => {
    if (backfillMutation.isPending) return;
    const confirmed = confirm(
      '기존 모든 아티클의 본문을 최신 내용으로 업데이트합니다. 이 작업은 시간이 걸릴 수 있습니다. 계속하시겠습니까?',
    );
    if (confirmed) {
      backfillMutation.mutate();
    }
  };

  const checkMarkdown = (text: string): boolean => {
    if (!text || typeof text !== 'string') {
      return false;
    }
    if (text.length < 2) {
      return false;
    }
    const lines = text.split('\n');
    const hasMarkdownFeatures = lines.some((line) => {
      line = line.trim();
      return (
        line.startsWith('#') ||
        line.startsWith('- ') ||
        line.startsWith('> ') ||
        /!\[.*\]\(.*\)/.test(line) ||
        /\[.*\]\(.*\)/.test(line) ||
        line.startsWith('```') ||
        /\*\*.*\*\*/.test(line) ||
        /_.*_/.test(line)
      );
    });

    return hasMarkdownFeatures;
  };

  const isImageRelative = (html: string): boolean => {
    const imageRegex = /<img[^>]+src="([^">]+)"/g;
    const matches = [...html.matchAll(imageRegex)];

    return matches.some((match) => {
      const src = match[1];
      return src.startsWith('/') || src.startsWith('./') || src.startsWith('../');
    });
  };

  const handleConvertMarkdown = async () => {
    try {
      const response = await fetch('/api/convert-markdown', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to convert markdown');
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      alert(`마크다운 변환 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleRefreshRSS = async () => {
    try {
      const response = await fetch('/api/rss');
      const result = await response.json();
      if (result.success) {
        toast({
          title: `${result.articles}개의 새로운 아티클을 수집했습니다.`,
          variant: 'default',
        });
        refetch();
      }
    } catch {
      toast({
        title: 'RSS 수집 중 오류가 발생했습니다.',
        variant: 'error',
      });
    }
  };

  const handleExtractThumbnails = async () => {
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
          variant: 'default',
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
  };

  const handleRefreshITNews = async () => {
    try {
      const response = await fetch('/api/it-news/rss');
      const result = await response.json();
      if (result.success) {
        toast({
          title: `${result.articles}개의 새로운 IT 뉴스를 수집했습니다.`,
          variant: 'default',
        });
        refetch();
      }
    } catch {
      toast({
        title: 'IT 뉴스 RSS 수집 중 오류가 발생했습니다.',
        variant: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          handleRefreshRSS={handleRefreshRSS}
          handleExtractThumbnails={handleExtractThumbnails}
          handleRefreshITNews={handleRefreshITNews}
        />
        <ArticleSkeleton />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          handleRefreshRSS={handleRefreshRSS}
          handleExtractThumbnails={handleExtractThumbnails}
          handleRefreshITNews={handleRefreshITNews}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">아티클을 찾을 수 없습니다</h1>
            <p className="mb-4 text-gray-600">요청하신 아티클이 존재하지 않거나 삭제되었습니다.</p>
            <BackButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        handleRefreshRSS={handleRefreshRSS}
        handleExtractThumbnails={handleExtractThumbnails}
        handleRefreshITNews={handleRefreshITNews}
      />
      <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
        <div className="relative mx-auto max-w-4xl">
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform lg:bottom-auto lg:left-6 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200/50 bg-white/90 p-2 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-lg lg:flex-col">
              <LikeButton
                articleId={articleId}
                articleType={articleType}
                initialLiked={likeStatus?.liked || false}
                initialLikeCount={likeStatus?.likeCount || article.like_count || 0}
                variant="default"
              />

              <ShareButton articleId={articleId} articleTitle={article.title} variant="default" />
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <BackButton variant="outline" size="sm" />

              {isAdmin && (
                <Button
                  onClick={handleBackfill}
                  disabled={backfillMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="ml-4 text-xs">
                  {backfillMutation.isPending ? '업데이트 중' : '기존 본문 채우기'}
                </Button>
              )}
            </div>

            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-gray-500">{article.source_name}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {article && article.pub_date
                  ? new Date(article.pub_date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '날짜 정보 없음'}
              </span>
              {typeof article.view_count === 'number' && (
                <>
                  <span className="text-sm text-gray-500">•</span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Eye size={14} />
                    <span>{article.view_count.toLocaleString()}회</span>
                  </div>
                </>
              )}
            </div>

            <h1 className="mb-4 text-3xl font-bold text-gray-900">{article.title}</h1>

            <div className="mb-6 rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-600">원문 출처</p>
                  <p className="font-medium text-gray-900">{article.source_name}</p>
                </div>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600">
                  <ExternalLink size={12} />
                  원문 보기
                </a>
              </div>
            </div>
          </div>

          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            {article.content ? (
              <>
                <div className="article-content" dangerouslySetInnerHTML={{ __html: processedContent }} />
                <InArticleAd />
              </>
            ) : (
              <div className="leading-relaxed text-gray-800">
                <p className="mb-4">{article.description}</p>
                <InArticleAd />
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-yellow-800">
                    이 아티클의 전체 내용을 확인하시려면{' '}
                    <a href={article.link} className="text-blue-600" target="_blank" rel="noopener noreferrer">
                      원문 링크
                    </a>
                    를 클릭해주세요.
                  </p>
                </div>
              </div>
            )}
          </div>

          <CommentSection articleId={articleId} />

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <BackButton variant="ghost" className="text-gray-600 hover:text-gray-800" />
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                원문에서 계속 읽기
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <ScrollNavigation />
    </div>
  );
}
