'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MomentVO } from '@/types';
import MomentItem from './MomentItem';
import { momentApi } from '@/lib/api/moment';

interface MomentListProps {
  moments: MomentVO[];
}

export default function MomentList({ moments }: MomentListProps) {
  const [statsById, setStatsById] = useState<
    Record<number, { viewCount: number; likeCount: number; commentCount: number }>
  >({});
  const ids = useMemo(() => (moments || []).map(m => m.id).filter(Boolean), [moments]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!ids.length) return;
      try {
        const stats = await momentApi.client.getStats(ids);
        if (cancelled) return;
        const next: Record<number, { viewCount: number; likeCount: number; commentCount: number }> = {};
        for (const item of stats) {
          next[item.id] = {
            viewCount: item.viewCount,
            likeCount: item.likeCount,
            commentCount: item.commentCount,
          };
        }
        setStatsById(next);
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (!moments || moments.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">暂无说说</div>;
  }

  return (
    <div className="space-y-6">
      {moments.map((moment) => (
        <MomentItem
          key={moment.id}
          moment={statsById[moment.id] ? ({ ...moment, ...statsById[moment.id] } as MomentVO) : moment}
        />
      ))}
    </div>
  );
}
