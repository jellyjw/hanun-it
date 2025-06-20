'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { ArrowLeft, ExternalLink, Eye } from 'lucide-react';
import { ArticleResponse } from '@/types/articles';
import CommentSection from '@/components/comments/CommentSection';
import { marked } from 'marked';
import { processArticleContent, detectContentType } from '@/utils/markdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArticleSkeleton } from '@/components/skeleton/ArticleSkeleton';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params?.id as string;

  const { data, isLoading, error, refetch } = useQuery<ArticleResponse>({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${articleId}`);
      if (!response.ok) throw new Error('Failed to fetch article');
      return response.json();
    },
  });

  const incrementViewMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/articles/${id}/view`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to increment view count');
      return response.json();
    },
  });

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
        line.startsWith('#') || // 제목
        line.startsWith('- ') || // 목록
        line.startsWith('> ') || // 인용문
        /!\[.*\]\(.*\)/.test(line) || // 이미지
        /\[.*\]\(.*\)/.test(line) || // 링크
        line.startsWith('```') || // 코드 블록
        /\*\*.*\*\*/.test(line) || // 굵은 글씨
        /_.*_/.test(line) // 기울임 글씨
      );
    });

    return hasMarkdownFeatures;
  };

  const isImageRelative = (html: string): boolean => {
    // HTML img 태그 매칭
    const imageRegex = /<img[^>]+src="([^">]+)"/g;
    const matches = [...html.matchAll(imageRegex)];

    return matches.some((match) => {
      const src = match[1];
      return src.charAt(0) === '/';
    });
  };

  // 컴포넌트 마운트 시 조회수 증가
  useEffect(() => {
    if (articleId && data?.success) {
      incrementViewMutation.mutate(articleId);
    }
  }, [articleId, data?.success]);

  const processedContent = useMemo(() => {
    if (!data?.article?.content) return '';

    console.log('원본 콘텐츠:', data.article.content.substring(0, 500));
    console.log('콘텐츠 타입:', detectContentType(data.article.content));

    const contentType = detectContentType(data.article.content);
    if (contentType === 'html') {
      return data.article.content;
    }

    // 마크다운인 경우에만 변환
    return processArticleContent(data.article.content);
  }, [data?.article?.content]);

  const handleConvertMarkdown = async () => {
    if (isLoading) return;

    const confirmed = confirm('기존 마크다운 아티클들을 HTML로 변환하시겠습니까?');
    if (!confirmed) return;

    try {
      const response = await fetch('/api/articles/convert-markdown', {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        refetch();
      } else {
        alert('마크다운 변환 실패: ' + result.error);
      }
    } catch {
      alert('마크다운 변환 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return <ArticleSkeleton />;
  }

  if (error || !data?.success) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">오류가 발생했습니다</h1>
          <p className="mb-4 text-gray-600">아티클을 불러올 수 없습니다.</p>
          <button onClick={() => router.back()} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const article = data.article;

  const hasRelativeImages = isImageRelative(article.content || '');
  if (hasRelativeImages) {
    const link = article.link;
    const domain = link.split('/')[2];
    article.content = article.content?.replace(/src="([^"]+)"/g, `src="https://${domain}$1"`);
  }

  article.content = article.content?.replace(/https:\/\/techblog\.woowa\.in/g, 'https://techblog.woowahan.com');

  return (
    <div className="container mx-auto max-w-4xl p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft size={20} />
          목록으로 돌아가기
        </button>
        {/* <Button onClick={handleConvertMarkdown} variant="outline" size="sm" className="text-xs">
          마크다운 변환
        </Button> */}

        <div className="mb-2 flex items-center gap-2">
          <Badge variant={article.is_domestic ? 'success-medium' : 'info-medium'} showIcon={false} size="sm">
            {article.is_domestic ? '국내' : '해외'}
          </Badge>
          <span className="text-sm text-gray-500">{article.source_name}</span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">
            {new Date(article.pub_date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {article.view_count !== undefined && (
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

        {/* 원문 링크 */}
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

      {/* 아티클 내용 */}
      <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
        {article.content ? (
          <div className="article-content" dangerouslySetInnerHTML={{ __html: processedContent }} />
        ) : (
          <div className="leading-relaxed text-gray-800">
            <p className="mb-4">{article.description}</p>
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

      {/* 하단 액션 */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800">
            ← 목록으로 돌아가기
          </button>
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
  );
}
