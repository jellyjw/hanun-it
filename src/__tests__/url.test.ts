import { describe, it, expect } from 'vitest';
import { getAbsoluteUrl, getArticleUrl, getImageUrl } from '@/utils/url';

describe('getAbsoluteUrl', () => {
  it('returns base URL when no path given', () => {
    const url = getAbsoluteUrl();
    expect(url).toMatch(/^https?:\/\//);
  });

  it('appends path with leading slash', () => {
    const url = getAbsoluteUrl('/articles');
    expect(url).toContain('/articles');
  });

  it('adds leading slash if missing', () => {
    const url = getAbsoluteUrl('articles');
    expect(url).toContain('/articles');
  });
});

describe('getArticleUrl', () => {
  it('generates correct article URL', () => {
    const url = getArticleUrl('abc-123');
    expect(url).toContain('/articles/abc-123');
  });
});

describe('getImageUrl', () => {
  it('returns default logo for null input', () => {
    const url = getImageUrl(null);
    expect(url).toContain('/assets/logo/logo.png');
  });

  it('returns default logo for undefined input', () => {
    const url = getImageUrl(undefined);
    expect(url).toContain('/assets/logo/logo.png');
  });

  it('returns absolute URL as-is for http URLs', () => {
    const url = getImageUrl('https://example.com/img.png');
    expect(url).toBe('https://example.com/img.png');
  });

  it('returns absolute URL as-is for https URLs', () => {
    const url = getImageUrl('http://example.com/img.png');
    expect(url).toBe('http://example.com/img.png');
  });

  it('converts relative path to absolute URL', () => {
    const url = getImageUrl('/images/photo.jpg');
    expect(url).toContain('/images/photo.jpg');
    expect(url).toMatch(/^https?:\/\//);
  });
});
