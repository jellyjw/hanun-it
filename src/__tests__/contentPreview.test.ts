import { describe, it, expect } from 'vitest';
import { extractFirstImage, extractTextPreview, getContentPreview } from '@/utils/contentPreview';

describe('extractFirstImage', () => {
  it('returns null for empty string', () => {
    expect(extractFirstImage('')).toBeNull();
  });

  it('extracts src from img tag with double quotes', () => {
    const html = '<p>Hello</p><img src="https://example.com/image.png" alt="test">';
    expect(extractFirstImage(html)).toBe('https://example.com/image.png');
  });

  it('extracts src from img tag with single quotes', () => {
    const html = "<img src='https://example.com/photo.jpg'>";
    expect(extractFirstImage(html)).toBe('https://example.com/photo.jpg');
  });

  it('returns first image when multiple images exist', () => {
    const html = '<img src="first.png"><img src="second.png">';
    expect(extractFirstImage(html)).toBe('first.png');
  });

  it('returns null when no img tag exists', () => {
    const html = '<p>No images here</p>';
    expect(extractFirstImage(html)).toBeNull();
  });
});

describe('extractTextPreview', () => {
  it('returns empty string for empty input', () => {
    expect(extractTextPreview('')).toBe('');
  });

  it('strips HTML tags', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    expect(extractTextPreview(html)).toBe('Hello world');
  });

  it('removes style and script tags with content', () => {
    const html = '<style>.foo{color:red}</style><script>alert(1)</script><p>Text</p>';
    expect(extractTextPreview(html)).toBe('Text');
  });

  it('replaces &nbsp; with space', () => {
    const html = '<p>Hello&nbsp;world</p>';
    expect(extractTextPreview(html)).toBe('Hello world');
  });

  it('truncates long text with ellipsis', () => {
    const longText = '<p>' + 'A'.repeat(500) + '</p>';
    const result = extractTextPreview(longText, 100);
    expect(result.length).toBeLessThanOrEqual(104); // 100 + "..."
  });

  it('respects custom maxChars', () => {
    const html = '<p>Short text</p>';
    expect(extractTextPreview(html, 5000)).toBe('Short text');
  });
});

describe('getContentPreview', () => {
  it('returns both image and text from HTML', () => {
    const html = '<img src="photo.jpg"><p>Article content here</p>';
    const result = getContentPreview(html);
    expect(result.image).toBe('photo.jpg');
    expect(result.text).toBe('Article content here');
  });

  it('returns null image when no image present', () => {
    const html = '<p>Just text</p>';
    const result = getContentPreview(html);
    expect(result.image).toBeNull();
    expect(result.text).toBe('Just text');
  });
});
