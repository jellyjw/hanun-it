import { Pagination } from "./articles";

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // 댓글 작성 시점의 사용자 프로필 스냅샷
  user_email?: string;
  user_full_name?: string;
  user_username?: string;
  user_avatar_url?: string;
  // 클라이언트에서 사용할 프로필 정보 (API 응답용)
  user_profile?: {
    email: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface CommentResponse {
  success: boolean;
  comment: Comment;
}

export interface CommentsResponse {
  success: boolean;
  comments: Comment[];
  pagination: Pagination;
}

export interface CreateCommentRequest {
  article_id: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
