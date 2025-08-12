'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header/Header';
import { useToast } from '@/hooks/use-toast';

interface VideoDetails {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoId: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
}

export default function VideoDetailPage() {
  const params = useParams();
  const videoId = params.videoId as string;
  const { toast } = useToast();

  const { data: video, isLoading, error, refetch } = useQuery<VideoDetails>({
    queryKey: ['video-detail', videoId],
    queryFn: async () => {
      const response = await fetch(`/api/youtube/video/${videoId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch video details');
      }
      return response.json();
    },
    enabled: !!videoId,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const handleRefreshRSS = async () => {
    try {
      refetch();
      toast({
        title: '영상 정보를 새로고침했습니다.',
        variant: 'default',
      });
    } catch {
      toast({
        title: '영상 새로고침 중 오류가 발생했습니다.',
        variant: 'error',
      });
    }
  };

  const handleExtractThumbnails = async () => {
    // 비디오 페이지에서는 썸네일 추출 기능 불필요
  };

  const handleRefreshITNews = async () => {
    // 비디오 페이지에서는 IT 뉴스 새로고침 불필요
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header 
          handleRefreshRSS={handleRefreshRSS}
          handleExtractThumbnails={handleExtractThumbnails}
          handleRefreshITNews={handleRefreshITNews}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-orange-500">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 opacity-25 blur"></div>
              </div>
              <div className="text-center">
                <p className="mb-2 text-lg font-medium text-slate-700 dark:text-slate-300">
                  영상 정보를 불러오는 중입니다
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">잠시만 기다려주세요...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-white">
        <Header 
          handleRefreshRSS={handleRefreshRSS}
          handleExtractThumbnails={handleExtractThumbnails}
          handleRefreshITNews={handleRefreshITNews}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-[500px] items-center justify-center">
            <Card className="w-full max-w-md border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardHeader className="pb-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-orange-500">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-800">영상을 찾을 수 없습니다</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-center">
                <p className="mb-4 text-sm text-slate-600">
                  요청하신 영상을 불러올 수 없습니다. 영상이 삭제되었거나 접근할 수 없는 상태일 수 있습니다.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => window.history.back()}>
                    뒤로 가기
                  </Button>
                  <Button onClick={() => refetch()}>
                    다시 시도
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        handleRefreshRSS={handleRefreshRSS}
        handleExtractThumbnails={handleExtractThumbnails}
        handleRefreshITNews={handleRefreshITNews}
      />
      <div className="container mx-auto px-4 py-8">
        <VideoPlayer
          videoId={video.videoId}
          title={video.title}
          channelTitle={video.channelTitle}
          description={video.description}
          publishedAt={video.publishedAt}
          viewCount={video.viewCount}
        />
      </div>
    </div>
  );
}