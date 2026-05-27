import { NextResponse } from 'next/server';

const CLIENT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:8888' : '');
const SERVER_BASE_URL = process.env.SERVER_API_BASE_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:8888' : 'http://127.0.0.1:8888');
const API_BASE_URL = SERVER_BASE_URL || CLIENT_BASE_URL;

function normalizeApiUrl(base: string, path: string) {
  const baseTrim = base.endsWith('/') ? base.slice(0, -1) : base;
  const pathTrim = path.startsWith('/') ? path : `/${path}`;
  if (baseTrim.endsWith('/api') && pathTrim.startsWith('/api/')) {
    return baseTrim + pathTrim.slice(4);
  }
  return baseTrim + pathTrim;
}

export async function GET() {
  let response: Response;

  try {
    response = await fetch(normalizeApiUrl(API_BASE_URL, '/api/public/rss'), {
      headers: {
        Accept: 'application/rss+xml',
      },
      next: {
        revalidate: 300,
      },
    });
  } catch {
    return unavailable();
  }

  if (!response.ok) {
    return unavailable();
  }

  return new NextResponse(await response.text(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300',
    },
  });
}

function unavailable() {
  return new NextResponse('RSS feed is temporarily unavailable.', {
    status: 502,
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
}
