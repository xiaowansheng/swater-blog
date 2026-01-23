'use client';

import { safeRandomUUID } from '@/lib/utils/uuid';
import { useEffect, useRef } from 'react';
import { trackEnter, type ContentType } from '@/lib/api/track';

function getOrCreateId(key: string, storage: Storage) {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const id = safeRandomUUID();
  storage.setItem(key, id);
  return id;
}

export default function ContentTracker({
  contentType,
  contentId,
}: {
  contentType: ContentType;
  contentId: number;
}) {
  const lastKeyRef = useRef<string>('');

  useEffect(() => {
    const key = `${contentType}:${contentId}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    const visitorKey = 'visitor_uuid';
    const visitorUuid = getOrCreateId(visitorKey, window.localStorage);

    const url = window.location.href;
    const referer = document.referrer || undefined;
    const params = new URL(url).searchParams;

    const pageKey = key;

    trackEnter({
      visitorUuid,
      pageKey,
      pageUrl: url,
      referer,
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
      contentType,
      contentId,
    })
      .then((res) => {
        if (res?.visitorUuid && res.visitorUuid !== visitorUuid) {
          window.localStorage.setItem(visitorKey, res.visitorUuid);
        }
      })
      .catch(() => {});
  }, [contentType, contentId]);

  return null;
}

