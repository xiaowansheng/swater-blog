import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

function getToken(req: NextRequest) {
  return req.headers.get('x-revalidate-token') || req.nextUrl.searchParams.get('secret') || '';
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
  if (!expected || token !== expected) {
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
    revalidateTag(tag);
  }

  return NextResponse.json({ ok: true, revalidated: tags });
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  const expected = process.env.REVALIDATE_TOKEN || '';
  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const tags = getTags(req, null);
  if (tags.length === 0) {
    return NextResponse.json({ ok: false, message: 'Missing tag(s)' }, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ ok: true, revalidated: tags });
}
