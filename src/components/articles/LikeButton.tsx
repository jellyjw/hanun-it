'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLikeMutation } from '@/hooks/useLikeMutation';
import { useLikeStatus } from '@/hooks/useLikeStatus';

interface LikeButtonProps {
  articleId: string;
  articleType?: 'article' | 'it_news' | 'translated_article';
  initialLiked?: boolean;
  initialLikeCount?: number;
  onLikeChange?: (liked: boolean, likeCount: number) => void;
  variant?: 'default' | 'compact';
}

export default function LikeButton({
  articleId,
  articleType = 'article',
  initialLiked = false,
  initialLikeCount = 0,
  onLikeChange,
  variant = 'default',
}: LikeButtonProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const likeMutation = useLikeMutation();

  // 서버에서 좋아요 상태 조회 (로그인 여부와 관계없이 조회)
  const { data: likeStatus, isLoading: isLikeStatusLoading } = useLikeStatus({
    articleId,
    articleType,
    enabled: true,
  });

  // 서버 상태를 우선으로 하고, 로딩 중이면 초기값 사용
  // 로그인하지 않은 사용자는 항상 liked: false
  const liked = !user ? false : isLikeStatusLoading ? initialLiked : (likeStatus?.liked ?? initialLiked);
  const likeCount = isLikeStatusLoading ? initialLikeCount : (likeStatus?.likeCount ?? initialLikeCount);

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: '로그인 필요',
        description: '좋아요 기능을 사용하려면 로그인이 필요합니다.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await likeMutation.mutateAsync({ articleId, articleType });

      if (result.success) {
        const newLiked = result.liked;
        onLikeChange?.(newLiked, likeCount);
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
      toast({
        title: '오류',
        description: '좋아요 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLikeToggle}
        disabled={likeMutation.isPending || isLikeStatusLoading}
        className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
          liked
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500'
        }`}>
        <Heart
          className={`h-4 w-4 transition-all duration-200 ${
            liked ? 'fill-current text-red-500' : 'fill-none group-hover:fill-red-100'
          }`}
        />
        <span className="w-10 text-center">{isLikeStatusLoading ? '...' : likeCount}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLikeToggle}
      disabled={likeMutation.isPending || isLikeStatusLoading}
      className={`group flex h-auto flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 hover:scale-105 ${
        liked ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-red-50 hover:text-red-500'
      }`}>
      <Heart
        className={`h-5 w-5 transition-all duration-200 ${
          liked ? 'scale-110 fill-current text-red-500' : 'fill-none group-hover:scale-110 group-hover:fill-red-100'
        }`}
      />
      <span className="w-8 text-center text-xs font-semibold">{isLikeStatusLoading ? '...' : likeCount}</span>
    </Button>
  );
}
