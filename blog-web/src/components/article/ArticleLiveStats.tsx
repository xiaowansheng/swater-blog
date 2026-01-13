'use client';

import { useLiveStats } from '@/components/common/useLiveStats';
import { useTranslations } from 'next-intl';

export default function ArticleLiveStats({
  id,
  initial,
}: {
  id: number;
  initial: { viewCount: number; likeCount: number; commentCount: number };
}) {
  const t = useTranslations('common');
  const stats = useLiveStats({ type: 'ARTICLE', id, initial });

  return (
    <span>
      {stats.viewCount.toLocaleString()} {t('readCount')} · {stats.likeCount.toLocaleString()} {t('like')} ·{' '}
      {stats.commentCount.toLocaleString()} {t('comment')}
    </span>
  );
}

