'use client';

import { useMemo } from 'react';
import { formatDate } from '@/lib/utils/format';
import type { CommentVO } from '@/types';
import { AnimeCommentConfig } from './types';
import { getRandomAnimeAvatar } from './constants';
import ReplyForm from './ReplyForm';

interface ReplyState {
  items: CommentVO[];
  page: number;
  pages: number;
  loading: boolean;
  expanded: boolean;
}

interface AnimeCommentItemProps {
  comment: CommentVO;
  replyState?: ReplyState;
  onToggleReplies: (commentId: number, replyCount?: number) => void;
  onLoadMoreReplies: (commentId: number) => void;
  onReply: (commentId: number) => void;
  activeReplyFormId: number | null;
  onCloseReplyForm: () => void;
  onReplySubmitSuccess: (rootId: number) => void;
  targetType: 'ARTICLE' | 'TALK';
  targetId: number;
  config: AnimeCommentConfig;
}

const STATUS_LABEL = {
  pending: '审核中，仅自己可见',
  hidden: '已隐藏，仅自己可见',
};

function getStatusLabel(status: number | string | undefined) {
  if (status === 1 || status === 'published' || status === undefined) return null;
  if (status === 0 || status === 'pending') return STATUS_LABEL.pending;
  return STATUS_LABEL.hidden;
}

export default function AnimeCommentItem({
  comment,
  replyState,
  onToggleReplies,
  onLoadMoreReplies,
  onReply,
  activeReplyFormId,
  onCloseReplyForm,
  onReplySubmitSuccess,
  targetType,
  targetId,
  config,
}: AnimeCommentItemProps) {
  const avatar = comment.avatar || getRandomAnimeAvatar(comment.nickname);
  const showReplyForm = activeReplyFormId === comment.id;
  const statusLabel = useMemo(() => getStatusLabel(comment.status), [comment.status]);
  const replies = replyState?.items || [];
  const expanded = replyState?.expanded;
  const hasMoreReplies = replyState ? replyState.page < replyState.pages : false;
  const rootId = comment.rootId && comment.rootId > 0 ? comment.rootId : comment.id;
  const isDirectChild = !comment.parentId || comment.parentId === 0 || comment.parentId === rootId;
  const parentId = comment.parentId ?? 0;
  const isHiddenByModeration = comment.isVisible === 0;

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-br from-pink-50/50 to-white/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-pink-200 shadow-sm hover:shadow-md transition-all duration-300 relative group">
        {/* 头部 */}
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-3 border-pink-300 shadow-md group-hover:scale-110 transition-transform duration-300">
              <img
                src={avatar}
                alt={comment.nickname}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 text-xs animate-pulse">✨</div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-bold text-gray-800 text-base">
                {comment.nickname}
              </span>
              <span className="text-xs text-gray-400">
                #{comment.id}
                {!isDirectChild && comment.parentId && comment.parentId > 0 && (
                  <> → #{comment.parentId}</>
                )}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(comment.createTime, 'YYYY-MM-DD HH:mm')}
              </span>
              {comment.isAuthor && (
                <span className="text-xs text-white bg-purple-500 px-2 py-0.5 rounded-full">
                  作者
                </span>
              )}
              {statusLabel && comment.isOwner && (
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                  {statusLabel}
                </span>
              )}
            </div>

            {/* 内容 */}
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {isHiddenByModeration && <span className="text-gray-400 italic">评论已被隐藏 </span>}
              {comment.replyToUser?.nickname && (
                <span className="text-purple-500">@{comment.replyToUser.nickname} </span>
              )}
              {comment.content}
            </div>

            {/* 操作 */}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => onReply(comment.id)}
                className={`text-sm flex items-center gap-1 transition-colors group/btn ${
                  showReplyForm
                    ? 'text-purple-600 hover:text-purple-700'
                    : 'text-pink-500 hover:text-pink-600'
                }`}
              >
                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                {showReplyForm ? '收起回复' : '回复'}
              </button>
              {typeof comment.replyCount === 'number' && comment.replyCount > 0 && (
                <button
                  onClick={() => onToggleReplies(comment.id, comment.replyCount)}
                  className="text-sm text-purple-500 hover:text-purple-600 flex items-center gap-1 transition-colors"
                >
                  {expanded ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      收起 {comment.replyCount} 条回复
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      展开 {comment.replyCount} 条回复
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 回复表单 */}
      {showReplyForm && (
        <ReplyForm
          parentId={comment.id}
          rootId={rootId}
          parentNickname={comment.nickname}
          targetType={targetType}
          targetId={targetId}
          config={config}
          onSubmitSuccess={() => onReplySubmitSuccess(rootId)}
          onCancel={onCloseReplyForm}
        />
      )}

      {/* 回复列表 */}
      {expanded && (
        <div className="mt-4 ml-8 md:ml-12 space-y-4">
          {replyState?.loading && (
            <div className="text-sm text-gray-500">回复加载中...</div>
          )}
          {!replyState?.loading && replies.length === 0 && (
            <div className="text-sm text-gray-500">暂无回复</div>
          )}
          {replies.map((child) => (
            <div
              key={child.id}
              className="bg-white/80 border border-purple-100 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <img
                  src={child.avatar || getRandomAnimeAvatar(child.nickname)}
                  alt={child.nickname}
                  className="w-10 h-10 rounded-full border-2 border-purple-200"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-800">{child.nickname}</span>
                    <span className="text-xs text-gray-400">
                      #{child.id}
                      {child.parentId && child.parentId !== child.rootId && (
                        <> → #{child.parentId}</>
                      )}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(child.createTime, 'YYYY-MM-DD HH:mm')}
                    </span>
                    {child.isAuthor && (
                      <span className="text-xs text-white bg-purple-500 px-2 py-0.5 rounded-full">
                        作者
                      </span>
                    )}
                    {getStatusLabel(child.status) && child.isOwner && (
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        {getStatusLabel(child.status)}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap break-words mt-1">
                    {child.isVisible === 0 && <span className="text-gray-400 italic">评论已被隐藏 </span>}
                    {child.replyToUser?.nickname && (
                      <span className="text-purple-500">@{child.replyToUser.nickname} </span>
                    )}
                    {child.content}
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => onReply(child.id)}
                      className="text-xs text-purple-500 hover:text-purple-600"
                    >
                      回复
                    </button>
                  </div>
                  {activeReplyFormId === child.id && (
                    <div className="mt-3">
                      <ReplyForm
                        parentId={child.id}
                        rootId={rootId}
                        parentNickname={child.nickname}
                        targetType={targetType}
                        targetId={targetId}
                        config={config}
                        onSubmitSuccess={() => onReplySubmitSuccess(rootId)}
                        onCancel={onCloseReplyForm}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {hasMoreReplies && (
            <button
              type="button"
              onClick={() => onLoadMoreReplies(comment.id)}
              disabled={replyState?.loading}
              className="text-sm text-purple-500 hover:text-purple-600"
            >
              {replyState?.loading ? '加载中...' : '查看更多回复'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
