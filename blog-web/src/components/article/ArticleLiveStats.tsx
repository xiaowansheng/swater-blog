'use client';

import { useLiveStats } from '@/components/common/useLiveStats';

export default function ArticleLiveStats({
  id,
  initial,
}: {
  id: number;
  initial: { viewCount: number; likeCount: number; commentCount: number };
}) {
  const stats = useLiveStats({ type: 'ARTICLE', id, initial });

  return (
    <span>
      {stats.viewCount.toLocaleString()} 次阅读 · {stats.likeCount.toLocaleString()} 赞 ·{' '}
      {stats.commentCount.toLocaleString()} 评论
    </span>
  );
}

