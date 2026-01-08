'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { recordVisitorAccess } from '@/lib/api/visitor';

function getOrCreateId(key: string, storage: Storage) {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  storage.setItem(key, id);
  return id;
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
    const sessionKey = 'visitor_session_id';
    const visitorUuid = getOrCreateId(visitorKey, window.localStorage);
    const sessionId = getOrCreateId(sessionKey, window.sessionStorage);

    const url = window.location.href;
    const referer = document.referrer || undefined;
    const params = new URL(url).searchParams;

    recordVisitorAccess({
      visitorUuid,
      pageType: 'PAGE',
      pageId: pathname,
      pageUrl: url,
      referer,
      sessionId,
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
        // 静默失败，避免影响前台体验
      });
  }, [pathname, searchParams]);

  return null;
}

