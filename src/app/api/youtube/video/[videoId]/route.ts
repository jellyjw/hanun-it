import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

interface YoutubeVideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
  contentDetails: {
    duration: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    if (!YOUTUBE_API_KEY) {
      return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    const { videoId } = await params;

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // YouTube Videos API를 사용해 특정 비디오의 상세 정보 가져오기
    const response = await fetch(
      `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        videoId
      });
      
      if (response.status === 403) {
        return NextResponse.json({ 
          error: 'YouTube API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.',
          quotaExceeded: true 
        }, { status: 429 });
      }
      
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const item: YoutubeVideoItem = data.items[0];

    const video = {
      id: `youtube_${item.id}`,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      videoId: item.id,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount || '0'),
      likeCount: parseInt(item.statistics.likeCount || '0'),
      commentCount: parseInt(item.statistics.commentCount || '0'),
    };

    return NextResponse.json(video, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('YouTube video details API error:', error);
    return NextResponse.json({ error: 'Failed to fetch video details' }, { status: 500 });
  }
}