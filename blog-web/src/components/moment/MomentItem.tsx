'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { MomentVO } from '@/types';
import { formatDate } from '@/lib/utils/format';

interface MomentItemProps {
  moment: MomentVO;
}

export default function MomentItem({ moment }: MomentItemProps) {
  const t = useTranslations('common');

  return (
    <article className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all">
      <div className="flex gap-4 items-start mb-4">
        {moment.authorAvatar && (
          <Image
            src={moment.authorAvatar}
            alt={moment.authorName || '作者'}
            width={48}
            height={48}
            className="rounded-full flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 items-center mb-2">
            <span className="font-medium">{moment.authorName || '博主'}</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(moment.createTime)}
            </span>
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap break-words">{moment.content}</p>
          </div>
        </div>
      </div>

      {moment.images && moment.images.length > 0 && (
        <div className={`grid gap-2 mb-4 ${
          moment.images.length === 1 
            ? 'grid-cols-1 max-w-md' 
            : moment.images.length === 2 
            ? 'grid-cols-2 max-w-2xl'
            : 'grid-cols-3 max-w-3xl'
        }`}>
          {moment.images.map((img, idx) => (
            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={img}
                alt={`${moment.content.substring(0, 20)}...`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-6 items-center pt-4 border-t border-border text-sm text-muted-foreground">
        <div className="flex gap-1 items-center">
          <span>❤️</span>
          <span>{moment.likeCount || 0}</span>
        </div>
        <div className="flex gap-1 items-center">
          <span>💬</span>
          <span>{moment.commentCount || 0}</span>
        </div>
      </div>
    </article>
  );
}

