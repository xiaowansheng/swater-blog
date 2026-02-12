'use client';

import type { CommentVO, PrivacyConfig } from '@/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AnimeCommentConfig } from './types';
import AnimeCommentItem from './AnimeCommentItem';

interface ReplyState {
  items: CommentVO[];
  page: number;
  pages: number;
  loading: boolean;
  expanded: boolean;
}

interface AnimeCommentListProps {
  comments: CommentVO[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  sortOrder: 'latest' | 'oldest';
  onSortChange: (order: 'latest' | 'oldest') => void;
  onPageChange: (page: number) => void;
  onReply: (commentId: number) => void;
  activeReplyFormId: number | null;
  onCloseReplyForm: () => void;
  onReplySubmitSuccess: (rootId: number) => void;
  onToggleReplies: (commentId: number, replyCount?: number) => void;
  onLoadMoreReplies: (commentId: number) => void;
  replies: Record<number, ReplyState>;
  targetType: 'ARTICLE' | 'TALK';
  targetId: number;
  config: AnimeCommentConfig;
  privacy: PrivacyConfig;
}

/**
 * 二次元评论列表（两级）
 */
export default function AnimeCommentList({
  comments,
  loading,
  currentPage,
  totalPages,
  totalCount,
  sortOrder,
  onSortChange,
  onPageChange,
  onReply,
  activeReplyFormId,
  onCloseReplyForm,
  onReplySubmitSuccess,
  onToggleReplies,
  onLoadMoreReplies,
  replies,
  targetType,
  targetId,
  config,
  privacy,
}: AnimeCommentListProps) {
  const t = useTranslations('comment');
  const [jumpInput, setJumpInput] = useState('');

  const handleJump = () => {
    const value = Number.parseInt(jumpInput, 10);
    if (!Number.isFinite(value)) return;
    const targetPage = Math.min(Math.max(value, 1), totalPages);
    if (targetPage === currentPage) return;
    onPageChange(targetPage);
    setJumpInput('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
            ✨
          </div>
        </div>
        <p className="mt-4 text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 animate-float">٩(◕‿◕｡)۶</div>
        <p className="text-muted-foreground text-lg">{t('noComments')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t('pageInfo', { current: currentPage, total: totalPages, count: totalCount })}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="comment-sort" className="text-sm text-muted-foreground">
            {t('sortBy')}
          </label>
          <select
            id="comment-sort"
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as 'latest' | 'oldest')}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-colors focus:border-primary"
          >
            <option value="latest">{t('sortLatest')}</option>
            <option value="oldest">{t('sortOldest')}</option>
          </select>
        </div>
      </div>

      {comments.map((comment) => (
        <AnimeCommentItem
          key={comment.id}
          comment={comment}
          replyState={replies[comment.id]}
          onToggleReplies={onToggleReplies}
          onLoadMoreReplies={onLoadMoreReplies}
          onReply={onReply}
          activeReplyFormId={activeReplyFormId}
          onCloseReplyForm={onCloseReplyForm}
          onReplySubmitSuccess={onReplySubmitSuccess}
          targetType={targetType}
          targetId={targetId}
          config={config}
          privacy={privacy}
        />
      ))}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 rounded-lg border border-border text-sm text-primary hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('prevPage')}
          </button>

          <span className="text-sm text-muted-foreground">
            {t('pageIndicator', { current: currentPage, total: totalPages })}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 rounded-lg border border-border text-sm text-primary hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('nextPage')}
          </button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJump();
              }}
              placeholder={t('jumpPagePlaceholder')}
              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
            />
            <button
              type="button"
              onClick={handleJump}
              disabled={!jumpInput.trim()}
              className="px-3 py-2 rounded-lg border border-border text-sm text-primary hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('jumpPage')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
