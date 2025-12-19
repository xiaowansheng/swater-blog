'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
    <div className="border-l-2 pl-4">
      <div className="flex items-start gap-4 mb-2">
        {comment.avatar && (
          <img
            src={comment.avatar}
            alt={comment.nickname}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{comment.nickname}</span>
            <span className="text-sm text-foreground/60">
              {formatDate(comment.createTime, 'YYYY-MM-DD HH:mm', locale)}
            </span>
          </div>
          <p className="text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
          <button
            onClick={() => setShowReply(!showReply)}
            className="mt-2 text-sm text-primary hover:underline"
          >
            {t('reply')}
          </button>
        </div>
      </div>
      {showReply && (
        <div className="mt-4 ml-6">
          <CommentForm
            parentId={comment.id}
            postId={comment.postId}
            onSuccess={() => setShowReply(false)}
          />
        </div>
      )}
      {comment.children && comment.children.length > 0 && (
        <div className="mt-4 ml-6 space-y-4">
          {comment.children.map((child) => (
            <CommentItem key={child.id} comment={child} />
          ))}
        </div>
      )}
    </div>
  );
}

