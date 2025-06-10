import { NextRequest, NextResponse } from 'next/server';
import { YoutubeResponse } from '@/types/articles';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// 기술 관련 키워드
const TECH_KEYWORDS = [
  '웹개발',
  '코딩애플',
  '웹개발 인기 영상',
  '프론트엔드',
  '백엔드',
  '모바일개발',
  '앱개발',
  'OPENAI',
  'Frontend',
  'Backend',
  '코딩',
  '개발자',
  '리액트',
  '타입스크립트',
  '자바스크립트',
  'HTML',
  'CSS',
  'SQL',
  'NoSQL',
  'AI',
  '데이터분석',
  '데이터베이스',
  '머신러닝',
  'IT',
  'AI Agent',
  'AI Agent 개발',
  'AI Agent 개발 트렌드',
  'AI Agent 개발 트렌드 2025',
];

interface YoutubeSearchItem {
  id: {
    videoId: string;
  };
}

interface YoutubeVideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high?: { url: string };
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

function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match?.[1] || '').replace('H', '');
  const minutes = (match?.[2] || '').replace('M', '');
  const seconds = (match?.[3] || '').replace('S', '');

  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    if (!YOUTUBE_API_KEY) {
      return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const searchValue = searchParams.get('searchValue') || '';

    let query = '';

    if (searchValue.trim()) {
      query = `${searchValue} programming technology`;
    } else {
      // 랜덤한 기술 키워드 선택
      const randomKeyword = TECH_KEYWORDS[Math.floor(Math.random() * TECH_KEYWORDS.length)];
      query = randomKeyword;
    }

    // YouTube Search API 호출
    const searchResponse = await fetch(
      `${YOUTUBE_API_URL}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${limit}&order=relevance&publishedAfter=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&videoDuration=medium&videoDefinition=high&key=${YOUTUBE_API_KEY}`,
    );

    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({
        videos: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // 비디오 상세 정보 가져오기
    const videoIds = searchData.items.map((item: YoutubeSearchItem) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
    );

    if (!detailsResponse.ok) {
      throw new Error(`YouTube API error: ${detailsResponse.statusText}`);
    }

    const detailsData = await detailsResponse.json();

    const videos = detailsData.items.map((item: YoutubeVideoItem) => ({
      id: `youtube_${item.id}`,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      videoId: item.id,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: formatDuration(item.contentDetails.duration),
      viewCount: parseInt(item.statistics.viewCount || '0'),
      likeCount: parseInt(item.statistics.likeCount || '0'),
      commentCount: parseInt(item.statistics.commentCount || '0'),
    }));

    const response: YoutubeResponse = {
      videos,
      pagination: {
        page,
        limit,
        total: Math.min(searchData.pageInfo.totalResults, 1000), // YouTube API 제한
        totalPages: Math.ceil(Math.min(searchData.pageInfo.totalResults, 1000) / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ error: 'Failed to fetch YouTube videos' }, { status: 500 });
  }
}
