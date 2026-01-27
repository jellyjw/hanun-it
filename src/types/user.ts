// 마이페이지 관련 타입 정의

// 사용자 프로필 정보
export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  provider: string; // 'email', 'google', 'github' 등
  isSocialLogin: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// 프로필 수정 요청
export interface UpdateProfileRequest {
  avatarUrl?: string;
}

// 프로필 수정 응답
export interface UpdateProfileResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

// 비밀번호 변경 요청
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 비밀번호 변경 응답
export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// 아티클 조회 기록
export interface ArticleView {
  id: string;
  userId: string;
  articleId: string;
  articleType: 'article' | 'it_news' | 'translated_article';
  viewedAt: string;
}

// 좋아요한 아티클 (article_likes 테이블)
export interface ArticleLike {
  id: string;
  userId: string;
  articleId: string;
  articleType: 'article' | 'it_news' | 'translated_article';
  createdAt: string;
}

// 마이페이지용 아티클 카드 정보
export interface MyPageArticle {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  sourceName: string;
  pubDate: string;
  viewCount: number;
  likeCount: number;
  articleType: 'article' | 'it_news' | 'translated_article';
  // 좋아요/조회 시간
  actionAt: string;
}

// 좋아요한 글 목록 응답
export interface LikedArticlesResponse {
  success: boolean;
  articles: MyPageArticle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

// 읽은 글 목록 응답
export interface ViewedArticlesResponse {
  success: boolean;
  articles: MyPageArticle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

// 마이페이지 사용자 통계
export interface UserStats {
  totalLikes: number;
  totalViews: number;
  totalComments: number;
}

// 마이페이지 전체 데이터
export interface MyPageData {
  profile: UserProfile;
  stats: UserStats;
  recentLikes: MyPageArticle[];
  recentViews: MyPageArticle[];
}
