-- ============================================
-- 알림 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 알림 구독 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_name TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, source_name, category)
);

ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON notification_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON notification_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON notification_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_notification_subscriptions_user_id ON notification_subscriptions(user_id);

-- ============================================
-- 사용자 읽기 기록 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS user_reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  article_type TEXT NOT NULL,
  read_at TIMESTAMPTZ DEFAULT now(),
  read_duration_seconds INTEGER DEFAULT 0
);

ALTER TABLE user_reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading history"
  ON user_reading_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading history"
  ON user_reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading history"
  ON user_reading_history FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_reading_history_user_id ON user_reading_history(user_id);
CREATE INDEX idx_reading_history_user_article ON user_reading_history(user_id, article_id);
CREATE INDEX idx_reading_history_read_at ON user_reading_history(read_at DESC);

-- ============================================
-- 사용자 설정 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_categories JSONB DEFAULT '[]'::jsonb,
  preferred_sources JSONB DEFAULT '[]'::jsonb,
  email_notifications BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================
-- 관리자 활동 로그 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 자신의 로그 조회 가능 (is_admin 메타데이터 기반)
CREATE POLICY "Admins can view activity logs"
  ON admin_activity_logs FOR SELECT
  USING (
    auth.uid() = admin_id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Admins can insert activity logs"
  ON admin_activity_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
