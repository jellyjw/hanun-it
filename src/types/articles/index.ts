import { CategoryType } from '@/utils/constants';

export interface Article {
  id: string;
  title: string;
  description: string;
  link: string;
  content: string;
  pub_date: string;
  source_name: string;
  category: CategoryType;
  is_domestic: boolean;
  thumbnail: string;
  summary: string;
  view_count?: number;
  comment_count?: number;
  like_count?: number;
  is_translated?: boolean;
  original_article_id?: string;
  original_language?: string;
  translated_language?: string;
}

// * 목록 카드에서 사용하는 아티클 데이터 (영상 변환 데이터 포함)
// 영상 카테고리는 category를 'videos'로 바꾸고 videoId/duration을 덧붙이므로 category를 string으로 넓힌다.
export type ArticleCardData = Omit<Article, 'category'> & {
  category: string;
  videoId?: string;
  duration?: string;
};

// * 아티클 목록
export interface ArticlesResponse {
  success: boolean;
  articles: Article[];
  pagination: Pagination;
}

export interface ArticleResponse {
  success: boolean;
  article: Article;
  type?: 'article' | 'it-news' | 'translated';
}

export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoId: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface YoutubeResponse {
  videos: YoutubeVideo[];
  pagination: Pagination;
}
