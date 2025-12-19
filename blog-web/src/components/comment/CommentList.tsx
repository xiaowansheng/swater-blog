'use client';

import { useTranslations } from 'next-intl';
import CommentItem from './CommentItem';
import type { CommentVO } from '@/types';

interface CommentListProps {
  comments: CommentVO[];
}

export default function CommentList({ comments }: CommentListProps) {
  const t = useTranslations('comment');

  if (comments.length === 0) {
    return <p className="text-foreground/70">{t('noComments') || 'No comments yet'}</p>;
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}

