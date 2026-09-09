import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'crypto';

function getToken(req: NextRequest) {
  return req.headers.get('x-revalidate-token') || '';
}

/** 常量时间比较，避免逐字节短路泄露 token 前缀 */
function tokenMatches(provided: string, expected: string) {
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) {
    // 长度不同时仍做一次比较，保持耗时曲线平滑
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

function getTags(req: NextRequest, body: unknown) {
  const tags: string[] = [];
  const queryTag = req.nextUrl.searchParams.get('tag');
  if (queryTag) tags.push(queryTag);

  if (body && typeof body === 'object' && Array.isArray((body as { tags?: unknown }).tags)) {
    for (const tag of (body as { tags?: string[] }).tags || []) {
      if (typeof tag === 'string' && tag.trim()) {
        tags.push(tag.trim());
      }
    }
  }

  return Array.from(new Set(tags)).filter(Boolean);
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  const expected = process.env.REVALIDATE_TOKEN || '';
  if (!expected) {
    return NextResponse.json({ ok: false, message: 'Revalidation is not configured' }, { status: 503 });
  }
  if (!tokenMatches(token, expected)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const tags = getTags(req, body);
  if (tags.length === 0) {
    return NextResponse.json({ ok: false, message: 'Missing tag(s)' }, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(tag, 'default');
  }

  return NextResponse.json({ ok: true, revalidated: tags });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, message: 'Method Not Allowed' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}
