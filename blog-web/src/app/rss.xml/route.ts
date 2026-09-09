import { NextResponse } from 'next/server';
import { normalizeApiUrl } from '@/lib/utils/apiUrl';

const API_BASE_URL = process.env.SERVER_API_BASE_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:8888' : 'http://127.0.0.1:8888');

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
