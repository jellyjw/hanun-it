import { NextRequest, NextResponse } from 'next/server';
import { YoutubeResponse } from '@/types/articles';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// 한국 IT 관련 키워드 - 한국어 중심
const KOREAN_IT_KEYWORDS = [
  // 유명 한국 IT 유튜버
  '코딩애플',
  '드림코딩',
  '노마드코더',
  '생활코딩',
  '개발바닥',
  '조코딩',
  '김왼손의 왼손코딩',
  '테크보이 워니',
  '개발자 황준일',
  '우리밋_woorimIT',
  '코딩하는거니',
  '빨간색코딩',
  '별코딩',
  '동빈나',
  '서근개발자',
  '얄팍한 코딩사전',
  '한입 크기로 잘라 먹는',
  '워니코딩',
  '크롱 개발자',
  // 한국 개발 콘텐츠
  '한국 웹개발',
  '한국 프론트엔드',
  '한국 백엔드',
  '한국 개발자',
  '한국 프로그래밍',
  '한국 코딩',
  '한국 IT',
  '한국 스타트업',
  '한국 개발자 취업',
  '국내 개발자',
  '코딩 강의',
  '프로그래밍 강의',
  '웹개발 강의',
  '리액트 강의',
  '자바스크립트 강의',
  '타입스크립트 강의',
  '파이썬 강의',
  '자바 강의',
  '스프링 강의',
  '노드js 강의',
  '알고리즘 문제풀이',
  '코딩테스트 풀이',
  '백준 문제풀이',
  '프로그래머스 문제풀이',
  '개발자 일상',
  '개발자 브이로그',
  'IT 트렌드',
  '개발 팁',
  '프로그래밍 팁',
  '개발자 면접',
  '신입 개발자',
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
      query = `${searchValue} 한국 프로그래밍 개발`;
    } else {
      // 랜덤한 한국 IT 키워드 선택
      const randomKeyword = KOREAN_IT_KEYWORDS[Math.floor(Math.random() * KOREAN_IT_KEYWORDS.length)];
      query = randomKeyword;
    }

    // YouTube Search API 호출 - 한국 지역 설정 추가
    const searchResponse = await fetch(
      `${YOUTUBE_API_URL}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${limit}&order=relevance&publishedAfter=${new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()}&videoDuration=medium&videoDefinition=high&regionCode=KR&relevanceLanguage=ko&key=${YOUTUBE_API_KEY}`,
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
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
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
        hasNext: page < Math.ceil(Math.min(searchData.pageInfo.totalResults, 1000) / limit),
        hasPrev: page > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ error: 'Failed to fetch YouTube videos' }, { status: 500 });
  }
}
