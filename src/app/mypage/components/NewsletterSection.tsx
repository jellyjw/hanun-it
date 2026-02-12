'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Sparkles } from 'lucide-react';

export default function NewsletterSection() {
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
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex animate-pulse items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 w-40 rounded bg-gray-50 dark:bg-gray-800/50" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* 아이콘 */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isSubscribed ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
            {isSubscribed ? (
              <Sparkles className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Mail className="h-[18px] w-[18px] text-gray-400 dark:text-gray-500" />
            )}
          </div>

          {/* 콘텐츠 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold">뉴스레터</h3>
              {isSubscribed && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  구독 중
                </span>
              )}
            </div>

            <p className="text-muted-foreground mt-0.5 text-[13px]">
              매주 월요일, 최신 IT 아티클과 주간 인기 아티클이 전송돼요
            </p>

            {/* 버튼 */}
            <div className="mt-3 flex items-center gap-3">
              {isSubscribed ? (
                <button
                  onClick={handleUnsubscribe}
                  disabled={actionLoading}
                  className="text-[13px] text-red-500 transition-colors hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300">
                  {actionLoading ? '처리 중...' : '구독 취소'}
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={actionLoading}
                  className="text-[13px] text-blue-500 transition-colors hover:text-blue-600 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300">
                  {actionLoading ? '처리 중...' : '구독하기'}
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
