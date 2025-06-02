import { Pagination } from "./articles";

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
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
