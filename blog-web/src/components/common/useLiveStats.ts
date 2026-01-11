'use client';

import { useEffect, useState } from 'react';
import { articleApi } from '@/lib/api/article';
import { momentApi } from '@/lib/api/moment';

export type LiveStats = { viewCount: number; likeCount: number; commentCount: number };
export type LiveStatsType = 'ARTICLE' | 'TALK';

export function useLiveStats({
  type,
  id,
  initial,
}: {
  type: LiveStatsType;
  id: number;
  initial: LiveStats;
}) {
  const [stats, setStats] = useState<LiveStats>(initial);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const latest =
          type === 'ARTICLE'
            ? await articleApi.client.getStatsById(id)
            : await momentApi.client.getStatsById(id);
        if (cancelled) return;
        setStats({
          viewCount: latest.viewCount ?? 0,
          likeCount: latest.likeCount ?? 0,
          commentCount: latest.commentCount ?? 0,
        });
      } catch {
        // ignore
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  return stats;
}

