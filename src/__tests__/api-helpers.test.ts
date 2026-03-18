import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkIsAdmin } from '@/lib/admin';

function createMockSupabase(user: Record<string, unknown> | null, error: unknown = null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error,
      }),
    },
  };
}

describe('checkIsAdmin', () => {
  const originalEnv = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    delete process.env.ADMIN_EMAILS;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.ADMIN_EMAILS = originalEnv;
    } else {
      delete process.env.ADMIN_EMAILS;
    }
  });

  it('returns false when getUser returns error', async () => {
    const supabase = createMockSupabase(null, { message: 'Unauthorized' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await checkIsAdmin(supabase as any);
    expect(result).toBe(false);
  });

  it('returns false when no user', async () => {
    const supabase = createMockSupabase(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await checkIsAdmin(supabase as any);
    expect(result).toBe(false);
  });

  it('returns true when user has admin role in metadata', async () => {
    const supabase = createMockSupabase({
      email: 'user@example.com',
      user_metadata: { role: 'admin' },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await checkIsAdmin(supabase as any);
    expect(result).toBe(true);
  });

  it('returns true when user email is in ADMIN_EMAILS', async () => {
    process.env.ADMIN_EMAILS = 'admin@test.com, other@test.com';
    const supabase = createMockSupabase({
      email: 'admin@test.com',
      user_metadata: {},
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await checkIsAdmin(supabase as any);
    expect(result).toBe(true);
  });

  it('returns false when user email is not in ADMIN_EMAILS and no admin role', async () => {
    process.env.ADMIN_EMAILS = 'admin@test.com';
    const supabase = createMockSupabase({
      email: 'regular@test.com',
      user_metadata: {},
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await checkIsAdmin(supabase as any);
    expect(result).toBe(false);
  });

  it('handles empty ADMIN_EMAILS gracefully', async () => {
    process.env.ADMIN_EMAILS = '';
    const supabase = createMockSupabase({
      email: 'user@test.com',
      user_metadata: {},
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await checkIsAdmin(supabase as any);
    expect(result).toBe(false);
  });

  it('trims whitespace in ADMIN_EMAILS list', async () => {
    process.env.ADMIN_EMAILS = '  admin@test.com ,  other@test.com  ';
    const supabase = createMockSupabase({
      email: 'other@test.com',
      user_metadata: {},
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await checkIsAdmin(supabase as any);
    expect(result).toBe(true);
  });
});
