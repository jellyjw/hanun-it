export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  pub_date: string;
  source_name: string;
  is_domestic: boolean;
  view_count?: number;
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
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: Pagination;
}

export interface YoutubeResponse {
  videos: YoutubeVideo[];
  pagination: Pagination;
}
