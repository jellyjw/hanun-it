'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { User, Edit, Trash2, Save, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment } from '@/types/comments';

// dayjs 플러그인 및 로케일 설정
dayjs.extend(relativeTime);
dayjs.locale('ko');

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  currentUserId?: string;
  articleId: string;
}

export default function CommentList({ comments, isLoading, currentUserId, articleId }: CommentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const queryClient = useQueryClient();

  // 댓글 수정 뮤테이션
  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to update comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      setEditingId(null);
      setEditContent('');
    },
  });

  // 댓글 삭제 뮤테이션
  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
    },
  });

  const handleEditStart = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleEditSave = async (id: string) => {
    if (!editContent.trim()) return;
    updateCommentMutation.mutate({ id, content: editContent.trim() });
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      deleteCommentMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        <MessageCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => {
        const isOwner = currentUserId === comment.user_id;
        const isEditing = editingId === comment.id;

        return (
          <div key={comment.id} className="flex items-start space-x-3">
            {/* 사용자 아바타 */}
            <div className="flex-shrink-0">
              {comment.user_profile?.avatar_url ? (
                <img src={comment.user_profile.avatar_url} alt="프로필" className="h-10 w-10 rounded-full" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              )}
            </div>

            {/* 댓글 내용 */}
            <div className="min-w-0 flex-1">
              <div className="rounded-lg bg-gray-50 p-4">
                {/* 사용자 정보 */}
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {comment.user_profile?.full_name ||
                        comment.user_profile?.username ||
                        comment.user_profile?.email?.split('@')[0] ||
                        '사용자'}
                    </span>
                    <span className="text-sm text-gray-500">{dayjs(comment.created_at).fromNow()}</span>
                  </div>

                  {/* 수정/삭제 버튼 */}
                  {isOwner && !isEditing && (
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleEditStart(comment)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(comment.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* 댓글 내용 */}
                {isEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={handleEditCancel}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        취소
                      </Button>
                      <Button
                        onClick={() => handleEditSave(comment.id)}
                        size="sm"
                        disabled={!editContent.trim()}
                        className="flex items-center gap-1"
                      >
                        <Save className="h-4 w-4" />
                        저장
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-gray-800">{comment.content}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
