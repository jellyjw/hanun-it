'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';


const NEWSLETTER_TITLE = '뉴스레터 구독';
const NEWSLETTER_DESCRIPTION = '매주 월요일, 최신 IT 아티클과\n주간 인기 아티클이 전송돼요';

interface NewsletterSubscribeCardProps {
  className?: string;
}

export function NewsletterSubscribeCard({ className }: NewsletterSubscribeCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
    } else {
      setIsSubscribed(false);
      setLoading(false);
    }
  }, [user]);

  async function fetchSubscriptionStatus() {
    try {
      setLoading(true);
      const response = await fetch('/api/newsletter/subscribe');
      const data = await response.json();

      if (data.success) {
        setIsSubscribed(data.data.isSubscribed);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setIsSubscribed(true);
      } else {
        toast({
          title: '구독 실패',
          description: data.error,
          variant: 'error',
        });
      }
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnsubscribe() {
    try {
      setActionLoading(true);
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setIsSubscribed(false);
        toast({
          title: '구독 취소됨',
          description: '뉴스레터 구독이 취소되었습니다.',
          variant: 'success',
        });
      } else {
        toast({
          title: '구독 취소 실패',
          description: data.error,
          variant: 'error',
        });
      }
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return null;
  }

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/80 to-white p-5 dark:border-gray-800 dark:from-gray-800/50 dark:to-gray-900/50">
        {/* 아이콘 */}
        <div className="mb-3 flex justify-center">
          <span className="text-4xl">💌</span>
        </div>

        {/* 타이틀 */}
        <h3 className="mb-1.5 text-center text-base font-semibold text-gray-900 dark:text-white">{NEWSLETTER_TITLE}</h3>

        {/* 설명 */}
        <p className="mb-4 whitespace-pre-line text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {NEWSLETTER_DESCRIPTION}
        </p>

        {/* 버튼 */}
        {isSubscribed ? (
          <button
            onClick={handleUnsubscribe}
            disabled={actionLoading}
            className="w-full rounded-lg border border-red-500 bg-transparent py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950">
            {actionLoading ? '처리 중...' : '구독 취소'}
          </button>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={actionLoading}
            className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
            {actionLoading ? '처리 중...' : user ? '구독하기' : '로그인하고 구독하기'}
          </button>
        )}
      </div>
    </div>
  );
}
