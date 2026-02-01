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
      <div className="flex gap-1.5 items-center group/view">
        <svg className="w-4 h-4 text-primary/60 group-hover/view:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="group-hover/view:text-foreground/80 transition-colors">{stats.viewCount.toLocaleString()}</span>
      </div>
      <div className="flex gap-1.5 items-center group/comment">
        <svg className="w-4 h-4 text-accent/60 group-hover/comment:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="group-hover/comment:text-foreground/80 transition-colors">{stats.commentCount.toLocaleString()}</span>
      </div>
    </div>
  );
}
