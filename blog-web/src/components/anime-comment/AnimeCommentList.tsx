'use client';

import type { CommentVO } from '@/types';
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
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
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
}

/**
 * 二次元评论列表（两级）
 */
export default function AnimeCommentList({
  comments,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
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
}: AnimeCommentListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
            ✨
          </div>
        </div>
        <p className="mt-4 text-muted-foreground">加载评论中...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 animate-float">٩(◕‿◕｡)۶</div>
        <p className="text-muted-foreground text-lg">还没有评论哦，快来抢沙发吧~</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        />
      ))}

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 rounded-full border border-border text-primary hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? '加载中...' : '加载更多评论'}
          </button>
        </div>
      )}
    </div>
  );
}
