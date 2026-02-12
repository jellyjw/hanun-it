-- pg_cron 확장 활성화 (Supabase Dashboard에서 활성화 필요)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 매주 월요일 오전 9시 (KST) = 일요일 자정 (UTC)에 뉴스레터 발송
-- Supabase Dashboard > SQL Editor에서 실행

-- 1. 먼저 Supabase Dashboard > Database > Extensions에서 pg_cron 활성화

-- 2. 그 후 아래 SQL 실행:
/*
SELECT cron.schedule(
  'weekly-newsletter',
  '0 0 * * 1',  -- 매주 월요일 00:00 UTC (한국시간 09:00)
  $$
  SELECT net.http_post(
    url := 'https://hlpprevwdyjofudybzxk.supabase.co/functions/v1/send-newsletter',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    ),
    body := '{}'
  ) AS request_id;
  $$
);
*/

-- Cron job 확인
-- SELECT * FROM cron.job;

-- Cron job 삭제 (필요시)
-- SELECT cron.unschedule('weekly-newsletter');
