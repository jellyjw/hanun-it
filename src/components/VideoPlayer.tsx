'use client';

import { useState } from 'react';
import { ExternalLink, Share, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BackButton from '@/components/ui/BackButton';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  channelTitle: string;
  description?: string;
  publishedAt: string;
  viewCount?: number;
}

export default function VideoPlayer({
  videoId,
  title,
  channelTitle,
  description,
  publishedAt,
  viewCount,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `${channelTitle}의 YouTube 영상: ${title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      // 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  const handleOpenYoutube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div>
      {/* 네비게이션 */}
      <div className="mb-6 flex items-center justify-between">
        <BackButton />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
            <Share className="h-4 w-4" />
            공유
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenYoutube} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            YouTube에서 보기
          </Button>
        </div>
      </div>

      {/* 비디오 플레이어 */}
      <div className="mx-auto max-w-6xl">
        <Card className="mb-6 overflow-hidden">
          <div className="relative aspect-video bg-black">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
                    <Play className="ml-1 h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground">영상을 불러오는 중...</p>
                </div>
              </div>
            )}
            {!embedError ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&showinfo=0&fs=1&cc_load_policy=0&iv_load_policy=3&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setEmbedError(true);
                }}
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <div className="flex flex-col items-center gap-4 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
                    <Play className="ml-1 h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="mb-2 text-lg font-medium">동영상을 로드할 수 없습니다</p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      iframe 임베드에 실패했습니다. YouTube에서 직접 시청해주세요.
                    </p>
                    <Button onClick={handleOpenYoutube} className="bg-red-600 hover:bg-red-700">
                      YouTube에서 보기
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 비디오 정보 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 메인 정보 */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h1 className="mb-4 text-2xl font-bold leading-tight">{title}</h1>
                
                <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{channelTitle}</span>
                  </div>
                  {viewCount && (
                    <>
                      <span>•</span>
                      <span>조회수 {viewCount.toLocaleString()}회</span>
                    </>
                  )}
                  <span>•</span>
                  <span>
                    {new Date(publishedAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {description && (
                  <div className="border-t pt-4">
                    <h3 className="mb-2 font-semibold">설명</h3>
                    <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                      {description.length > 500 ? `${description.substring(0, 500)}...` : description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">채널 정보</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white">
                    {channelTitle.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{channelTitle}</p>
                    <p className="text-sm text-muted-foreground">YouTube 채널</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}