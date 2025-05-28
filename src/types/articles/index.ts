export interface Article {
  id: string;
  title: string;
  description: string;
  link: string;
  content: string;
  pub_date: string;
  source_name: string;
  category: string;
  is_domestic: boolean;
  thumbnail: string;
  summary: string;
  is_translated?: boolean;
  original_article_id?: string;
  original_language?: string;
  translated_language?: string;
}

// * 아티클 목록
export interface ArticlesResponse {
  success: boolean;
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ArticleResponse {
  success: boolean;
  article: Article;
}
