-- 원자적 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_view_count(p_table_name TEXT, p_article_id UUID)
RETURNS VOID AS $$
BEGIN
  IF p_table_name = 'articles' THEN
    UPDATE articles SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_article_id;
  ELSIF p_table_name = 'it_news' THEN
    UPDATE it_news SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_article_id;
  ELSIF p_table_name = 'translated_articles' THEN
    UPDATE translated_articles SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_article_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
