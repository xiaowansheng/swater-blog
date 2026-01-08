'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from '@/components/common/ImageWithPreview';
import CommentForm from './CommentForm';
import type { CommentVO } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { usePathname } from '@/lib/i18n/routing';

interface CommentItemProps {
  comment: CommentVO;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const t = useTranslations('comment');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';
  const [showReply, setShowReply] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {comment.avatar ? (
            <Image
              src={comment.avatar}
              alt={comment.nickname}
              width={48}
              height={48}
              className="rounded-full border-2 border-border"
              previewEnabled={false}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
              <span className="text-primary font-bold text-lg">{comment.nickname.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-semibold text-foreground">{comment.nickname}</span>
            <span className="text-sm text-muted flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(comment.createTime, 'YYYY-MM-DD HH:mm', locale)}
            </span>
          </div>
          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed mb-3">{comment.content}</p>
          <button
            onClick={() => setShowReply(!showReply)}
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            {t('reply')}
          </button>
        </div>
      </div>
      {showReply && (
        <div className="mt-4 ml-16">
          <CommentForm
            parentId={comment.id}
            targetId={comment.postId}
            targetType="ARTICLE"
            onSuccess={() => setShowReply(false)}
          />
        </div>
      )}
      {comment.children && comment.children.length > 0 && (
        <div className="mt-4 ml-16 space-y-4 border-l-2 border-border/40 pl-4">
          {comment.children.map((child) => (
            <CommentItem key={child.id} comment={child} />
          ))}
        </div>
      )}
    </div>
  );
}

