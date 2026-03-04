'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, AlertCircle } from 'lucide-react';
import CommentList from '@/components/comments/CommentList';
import { CommentsResponse, CreateCommentRequest } from '@/types/comments';

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // 댓글 목록 조회
  const { data: commentsData, isLoading } = useQuery<CommentsResponse>({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      const response = await fetch(`/api/comments?article_id=${articleId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    staleTime: 1000 * 60, // 1분
    gcTime: 1000 * 60 * 5, // 5분
  });

  // 댓글 작성 뮤테이션
  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentRequest) => {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      setNewComment('');
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error('댓글 작성 오류:', error);
      setIsSubmitting(false);
    },
  });

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 255) {
      setNewComment(value);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    createCommentMutation.mutate({
      article_id: articleId,
      content: newComment.trim(),
    });
  };

  return (
    <div className="mt-8 border-t pt-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center gap-2">
        <h3 className="text-2xl font-bold text-gray-900">Comments</h3>
        <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-green-500 px-2 text-sm font-semibold text-white">
          {commentsData?.pagination.total || 0}
        </span>
      </div>

      {/* 댓글 작성 폼 */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-gray-300 focus-within:border-gray-400 focus-within:bg-white">
            <Textarea
              value={newComment}
              onChange={handleCommentChange}
              placeholder="댓글을 작성해주세요"
              className="min-h-[120px] resize-none border-0 bg-transparent p-0 text-base placeholder:text-gray-400 focus-visible:ring-0"
              disabled={isSubmitting}
              maxLength={255}
            />
            <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
              <span className="text-sm text-gray-500">
                {newComment.length}/255
              </span>
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="bg-gray-900 px-6 py-2 font-medium text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 transition-colors">
                등록
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <p>
              댓글을 작성하려면{' '}
              <a href="/auth/login" className="text-blue-600 hover:underline">
                로그인
              </a>
              이 필요합니다.
            </p>
          </div>
        </div>
      )}

      {/* 댓글 목록 */}
      <CommentList
        comments={commentsData?.comments || []}
        isLoading={isLoading}
        currentUserId={user?.id}
        articleId={articleId}
      />
    </div>
  );
}
