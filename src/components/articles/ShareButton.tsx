'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  articleId: string;
  articleTitle?: string;
  articleUrl?: string;
  variant?: 'default' | 'compact';
}

export default function ShareButton({ articleId, articleTitle, articleUrl, variant = 'default' }: ShareButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = articleUrl || `${window.location.origin}/articles/${articleId}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: '링크 복사 완료!',
        description: '아티클 링크가 클립보드에 복사되었습니다.',
      });

      // 2초 후 아이콘 원상복구
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('링크 복사 중 오류:', error);
      toast({
        title: '오류',
        description: '링크 복사에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyLink}
        className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
          copied ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
        }`}>
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Share2 className="h-4 w-4 transition-all duration-200 group-hover:rotate-12" />
        )}
        <span className="w-10 text-center">{copied ? '복사됨' : '공유'}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopyLink}
      className={`group flex h-auto flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 hover:scale-105 ${
        copied ? 'bg-green-50 text-green-600' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
      }`}>
      {copied ? (
        <Check className="h-5 w-5 text-green-500 transition-all duration-200" />
      ) : (
        <Share2 className="h-5 w-5 transition-all duration-200 group-hover:rotate-12 group-hover:scale-110" />
      )}
      <span className="w-8 text-center text-xs font-semibold">{copied ? '복사됨' : '공유'}</span>
    </Button>
  );
}
