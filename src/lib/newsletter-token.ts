import crypto from 'crypto';

const SECRET = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || 'hanun-it-newsletter';

export function generateUnsubscribeToken(userId: string): string {
  const hmac = crypto.createHmac('sha256', SECRET).update(userId).digest('hex');
  return Buffer.from(`${userId}:${hmac}`).toString('base64url');
}

export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex === -1) return null;

    const userId = decoded.substring(0, separatorIndex);
    const providedHmac = decoded.substring(separatorIndex + 1);

    const expectedHmac = crypto.createHmac('sha256', SECRET).update(userId).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(providedHmac), Buffer.from(expectedHmac))) {
      return userId;
    }
    return null;
  } catch {
    return null;
  }
}
