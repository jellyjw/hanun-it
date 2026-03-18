import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') || '한눈IT';
  const source = searchParams.get('source') || '';
  const category = searchParams.get('category') || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {category && (
              <span
                style={{
                  background: 'rgba(167, 139, 250, 0.3)',
                  color: '#c4b5fd',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '20px',
                  border: '1px solid rgba(167, 139, 250, 0.4)',
                }}>
                {category}
              </span>
            )}
            {source && (
              <span
                style={{
                  background: 'rgba(99, 102, 241, 0.3)',
                  color: '#a5b4fc',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '20px',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                }}>
                {source}
              </span>
            )}
          </div>
          <h1
            style={{
              fontSize: title.length > 40 ? '48px' : '56px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.3,
              margin: 0,
              wordBreak: 'keep-all',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}>
            {title}
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
            <span
              style={{
                fontSize: '36px',
                fontWeight: 800,
                color: '#a78bfa',
              }}>
              한눈IT
            </span>
            <span
              style={{
                fontSize: '18px',
                color: '#94a3b8',
              }}>
              국내, 해외의 IT 최신 아티클을 한눈에
            </span>
          </div>
          <span
            style={{
              fontSize: '16px',
              color: '#64748b',
            }}>
            hanun-it.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
