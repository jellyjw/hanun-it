-- articles 테이블에 comment_count 칼럼 추가
ALTER TABLE articles ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- it_news 테이블에 comment_count 칼럼 추가
ALTER TABLE it_news ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- 기존 댓글 수 백필 (articles)
UPDATE articles
SET comment_count = sub.cnt
FROM (
  SELECT article_id, COUNT(*) AS cnt
  FROM comments
  GROUP BY article_id
) AS sub
WHERE articles.id = sub.article_id;

-- 기존 댓글 수 백필 (it_news)
UPDATE it_news
SET comment_count = sub.cnt
FROM (
  SELECT news_id, COUNT(*) AS cnt
  FROM it_news_comments
  GROUP BY news_id
) AS sub
WHERE it_news.id = sub.news_id;

-- articles 댓글 수 증감 트리거 함수
CREATE OR REPLACE FUNCTION update_article_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE articles SET comment_count = comment_count - 1 WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- it_news 댓글 수 증감 트리거 함수
CREATE OR REPLACE FUNCTION update_it_news_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE it_news SET comment_count = comment_count + 1 WHERE id = NEW.news_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE it_news SET comment_count = comment_count - 1 WHERE id = OLD.news_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER trg_update_article_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_article_comment_count();

CREATE TRIGGER trg_update_it_news_comment_count
  AFTER INSERT OR DELETE ON it_news_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_it_news_comment_count();

-- 인덱스 추가 (댓글순 정렬 최적화)
CREATE INDEX IF NOT EXISTS idx_articles_comment_count ON articles(comment_count DESC);
CREATE INDEX IF NOT EXISTS idx_it_news_comment_count ON it_news(comment_count DESC);
