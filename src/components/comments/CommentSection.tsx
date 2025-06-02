"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, AlertCircle } from "lucide-react";
import CommentList from "@/components/comments/CommentList";
import { CommentsResponse, CreateCommentRequest } from "@/types/comments";

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // 댓글 목록 조회
  const { data: commentsData, isLoading } = useQuery<CommentsResponse>({
    queryKey: ["comments", articleId],
    queryFn: async () => {
      const response = await fetch(`/api/comments?article_id=${articleId}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  // 댓글 작성 뮤테이션
  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentRequest) => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", articleId] });
      setNewComment("");
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("댓글 작성 오류:", error);
      setIsSubmitting(false);
    },
  });

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
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5" />
        <h3 className="text-xl font-semibold">
          댓글 ({commentsData?.pagination.total || 0})
        </h3>
      </div>

      {/* 댓글 작성 폼 */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해주세요..."
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "작성 중..." : "댓글 작성"}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <p>
              댓글을 작성하려면{" "}
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
