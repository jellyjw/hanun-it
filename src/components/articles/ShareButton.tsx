'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Check, Copy, MessageCircle, X as XIcon } from 'lucide-react';
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
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getUrl = () => articleUrl || `${window.location.origin}/articles/${articleId}`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      toast({
        title: '링크 복사 완료!',
        description: '아티클 링크가 클립보드에 복사되었습니다.',
      });
      setTimeout(() => setCopied(false), 2000);
      setShowMenu(false);
    } catch {
      toast({
        title: '오류',
        description: '링크 복사에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleKakaoShare = () => {
    const url = getUrl();
    window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    setShowMenu(false);
  };

  const handleTwitterShare = () => {
    const url = getUrl();
    const text = articleTitle || '';
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer',
    );
    setShowMenu(false);
  };

  const shareOptions = (
    <div
      ref={menuRef}
      className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="flex gap-1">
        <button
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          title="링크 복사">
          {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
          <span className="text-[10px] text-gray-500 dark:text-gray-400">{copied ? '복사됨' : '링크'}</span>
        </button>
        <button
          onClick={handleKakaoShare}
          className="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          title="카카오톡 공유">
          <MessageCircle className="h-5 w-5 text-yellow-500" />
          <span className="text-[10px] text-gray-500 dark:text-gray-400">카카오</span>
        </button>
        <button
          onClick={handleTwitterShare}
          className="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          title="X (Twitter) 공유">
          <XIcon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
          <span className="text-[10px] text-gray-500 dark:text-gray-400">X</span>
        </button>
      </div>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className="relative">
        {showMenu && shareOptions}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMenu(!showMenu)}
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
      </div>
    );
  }

  return (
    <div className="relative">
      {showMenu && shareOptions}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
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
    </div>
  );
}
