-- ============================================
-- 댓글 알림 트리거
-- 같은 아티클에 댓글을 달았던 다른 사용자에게 알림 생성
-- ============================================

-- 알림 생성을 위해 service_role 수준의 INSERT 정책 추가
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION notify_commenters_on_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  article_title TEXT;
  commenter_name TEXT;
  other_user_id UUID;
BEGIN
  -- 아티클 제목 조회 (articles, it_news, translated_articles 순서로 시도)
  SELECT title INTO article_title FROM articles WHERE id::text = NEW.article_id;
  IF article_title IS NULL THEN
    SELECT title INTO article_title FROM it_news WHERE id::text = NEW.article_id;
  END IF;
  IF article_title IS NULL THEN
    SELECT title INTO article_title FROM translated_articles WHERE id::text = NEW.article_id;
  END IF;
  IF article_title IS NULL THEN
    article_title := '게시글';
  END IF;

  -- 댓글 작성자 이름
  commenter_name := COALESCE(NEW.user_full_name, NEW.user_username, '사용자');

  -- 같은 아티클에 댓글을 달았던 다른 사용자들에게 알림 생성
  FOR other_user_id IN
    SELECT DISTINCT user_id
    FROM comments
    WHERE article_id = NEW.article_id
      AND user_id != NEW.user_id
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      other_user_id,
      'new_comment',
      '새 댓글',
      commenter_name || '님이 "' || LEFT(article_title, 50) || '"에 댓글을 남겼습니다.',
      '/articles/' || NEW.article_id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_insert_notify
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_commenters_on_new_comment();
