-- 뉴스레터 구독 테이블
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- RLS 정책
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 구독 정보만 조회 가능
CREATE POLICY "Users can view own subscription"
  ON newsletter_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 구독 정보만 생성 가능
CREATE POLICY "Users can insert own subscription"
  ON newsletter_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 구독 정보만 수정 가능
CREATE POLICY "Users can update own subscription"
  ON newsletter_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- 사용자는 자신의 구독 정보만 삭제 가능
CREATE POLICY "Users can delete own subscription"
  ON newsletter_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_newsletter_subscriptions_user_id ON newsletter_subscriptions(user_id);
CREATE INDEX idx_newsletter_subscriptions_is_active ON newsletter_subscriptions(is_active);
CREATE INDEX idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
