'use client';

import { safeRandomUUID } from '@/lib/utils/uuid';
import { useEffect, useRef } from 'react';
import { trackEnter, type ContentType } from '@/lib/api/track';
import { consumeDocumentNavigationEntry } from './documentReferrer';

function getOrCreateId(key: string, storage: Storage) {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const id = safeRandomUUID();
  storage.setItem(key, id);
  return id;
}

/** 同一内容在此时间窗口内不重复上报（毫秒） */
const THROTTLE_MS = 30_000;
const lastSentAt = new Map<string, number>();

function isThrottled(key: string): boolean {
  const now = Date.now();
  const last = lastSentAt.get(key);
  if (last !== undefined && now - last < THROTTLE_MS) return true;
  lastSentAt.set(key, now);
  return false;
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
    if (isThrottled(key)) return;
    lastKeyRef.current = key;

    const visitorKey = 'visitor_uuid';
    const visitorUuid = getOrCreateId(visitorKey, window.localStorage);

    const url = window.location.href;
    const { documentNavigation, referer } = consumeDocumentNavigationEntry(url);
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
      documentNavigation,
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
