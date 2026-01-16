'use client';

import { useLiveStats } from '@/components/common/useLiveStats';

export default function MomentLiveStats({
  id,
  initial,
}: {
  id: number;
  initial: { viewCount: number; likeCount: number; commentCount: number };
}) {
  const stats = useLiveStats({ type: 'TALK', id, initial });

  return (
    <div className="flex gap-6 items-center pt-3 mt-6 border-t border-border text-sm text-muted-foreground">
      <div className="flex gap-1 items-center">
        <span>👀</span>
        <span>{stats.viewCount.toLocaleString()}</span>
      </div>
      <div className="flex gap-1 items-center">
        <span>💬</span>
        <span>{stats.commentCount.toLocaleString()}</span>
      </div>
    </div>
  );
}
