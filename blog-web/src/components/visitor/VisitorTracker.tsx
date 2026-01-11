'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEnter } from '@/lib/api/track';

function getOrCreateId(key: string, storage: Storage) {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  storage.setItem(key, id);
  return id;
}

function fnv1a32Hex(input: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
    hash >>>= 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function normalizePageId(rawId: string) {
  if (rawId.length <= 255) return rawId;
  return `h_${fnv1a32Hex(rawId)}_${rawId.length}`;
}

function stripLocalePrefix(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0];
  const startIndex = locale === 'zh' || locale === 'en' ? 1 : 0;
  return '/' + segments.slice(startIndex).join('/');
}

function isContentRoute(pathname: string) {
  const normalized = stripLocalePrefix(pathname);
  return normalized.startsWith('/post/') || normalized.startsWith('/moment/');
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    if (!pathname) return;
    const fullPath = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    if (lastPathRef.current === fullPath) return;
    lastPathRef.current = fullPath;

    const visitorKey = 'visitor_uuid';
    const visitorUuid = getOrCreateId(visitorKey, window.localStorage);

    const url = window.location.href;
    const referer = document.referrer || undefined;
    const params = new URL(url).searchParams;
    if (isContentRoute(pathname)) return;

    const normalizedPath = stripLocalePrefix(pathname) || '/';
    const pageKey = `PAGE:${normalizePageId(normalizedPath)}`;

    trackEnter({
      visitorUuid,
      pageKey,
      pageUrl: url,
      referer,
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
    })
      .then((res) => {
        if (res?.visitorUuid && res.visitorUuid !== visitorUuid) {
          window.localStorage.setItem(visitorKey, res.visitorUuid);
        }
      })
      .catch(() => {
        // Silent failure to avoid impacting UX.
      });
  }, [pathname, searchParams]);

  return null;
}
