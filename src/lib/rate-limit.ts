import { NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// 주기적으로 만료된 엔트리 정리 (메모리 누수 방지)
const CLEANUP_INTERVAL = 60 * 1000; // 1분마다
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

/**
 * 인메모리 Rate Limiter
 * Vercel Serverless 환경에서는 인스턴스 간 공유되지 않으므로
 * 완벽한 rate limiting은 아니지만, 기본적인 보호를 제공합니다.
 *
 * @param key - rate limit 키 (보통 IP 주소)
 * @param limit - 윈도우 내 최대 요청 수
 * @param windowMs - 윈도우 크기 (밀리초)
 */
export function rateLimit(key: string, limit: number, windowMs: number): { success: boolean; remaining: number } {
  cleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  entry.count++;

  if (entry.count > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: limit - entry.count };
}

/**
 * API 라우트에서 사용할 rate limit 체커
 */
export function checkRateLimit(ip: string, endpoint: string, limit = 60, windowMs = 60 * 1000) {
  const key = `${endpoint}:${ip}`;
  const result = rateLimit(key, limit, windowMs);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(windowMs / 1000)) },
      },
    );
  }

  return null; // 통과
}
