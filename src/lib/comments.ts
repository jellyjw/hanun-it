/**
 * 댓글에 사용자 프로필 정보를 매핑합니다.
 */
export function mapCommentWithProfile<T extends {
  user_email?: string | null;
  user_full_name?: string | null;
  user_username?: string | null;
  user_avatar_url?: string | null;
}>(comment: T) {
  return {
    ...comment,
    user_profile: {
      email: comment.user_email || '',
      full_name: comment.user_full_name || null,
      username: comment.user_username || null,
      avatar_url: comment.user_avatar_url || null,
    },
  };
}
