'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimeCommentProps, AnimeCommentConfig, CommentFormData } from './types';
import { DEFAULT_COMMENT_CONFIG } from './constants';
import AnimeCommentForm from './AnimeCommentForm';
import AnimeCommentList from './AnimeCommentList';
import { UserInfoProvider, useUserInfo } from './UserInfoContext';
import { commentApi } from '@/lib/api/comment';
import type { CommentVO } from '@/types';

const COMMENT_PAGE_SIZE = 10;
const REPLY_PAGE_SIZE = 5;

interface ReplyState {
  items: CommentVO[];
  page: number;
  pages: number;
  loading: boolean;
  expanded: boolean;
}

/**
 * 仅发布者可见的特殊状态判定
 */
function useVisibilityChecker() {
  const { userInfo } = useUserInfo();

  const isOwner = (comment: CommentVO) => {
    if (comment.isOwner) return true;
    if (comment.email && userInfo.email && comment.email === userInfo.email) return true;
    if (comment.nickname && userInfo.nickname && comment.nickname === userInfo.nickname) return true;
    return false;
  };

  const isVisible = (comment: CommentVO) => {
    const status = comment.status;
    const published = status === 1 || status === 'published';
    if (published) return true;
    return isOwner(comment);
  };

  return { isOwner, isVisible };
}

/**
 * 两阶段查询 + 两级展示的评论容器
 */
function AnimeCommentInner({
  postId,
  momentId,
  config: userConfig,
  showTitle = true,
  className = '',
}: AnimeCommentProps) {
  const t = useTranslations('comment');
  const { isOwner, isVisible } = useVisibilityChecker();
  const [config, setConfig] = useState<AnimeCommentConfig>(DEFAULT_COMMENT_CONFIG);
  const [topComments, setTopComments] = useState<CommentVO[]>([]);
  const [topPage, setTopPage] = useState(1);
  const [topPages, setTopPages] = useState(1);
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingMoreTop, setLoadingMoreTop] = useState(false);
  const [replies, setReplies] = useState<Record<number, ReplyState>>({});
  const [activeReplyFormId, setActiveReplyFormId] = useState<number | null>(null);

  const targetType: CommentFormData['targetType'] = postId ? 'ARTICLE' : 'TALK';
  const targetId = postId ?? momentId;

  // 加载评论配置
  useEffect(() => {
    setConfig({ ...DEFAULT_COMMENT_CONFIG, ...userConfig });
  }, [userConfig]);

  // 过滤并标记“自己”的评论
  const normalize = (records: CommentVO[] = []) =>
    records
      .filter(isVisible)
      .map((item) => ({
        ...item,
        isOwner: isOwner(item),
      }));

  const loadTopComments = async (page = 1, append = false) => {
    if (!targetId) return;
    page === 1 ? setLoadingTop(true) : setLoadingMoreTop(true);
    try {
      const result = await commentApi.getTopComments({
        targetId,
        targetType,
        page,
        size: COMMENT_PAGE_SIZE,
        sort: 'time',
      });
      const normalized = normalize(result.records || []);
      setTopComments((prev) => (append ? [...prev, ...normalized] : normalized));
      setTopPage(result.current || page);
      setTopPages(result.pages || 1);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingTop(false);
      setLoadingMoreTop(false);
    }
  };

  const loadReplies = async (parentId: number, rootId: number, page = 1, append = false) => {
    setReplies((prev) => ({
      ...prev,
      [parentId]: {
        items: append ? prev[parentId]?.items || [] : [],
        page: prev[parentId]?.page || 0,
        pages: prev[parentId]?.pages || 1,
        loading: true,
        expanded: true,
      },
    }));
    try {
      const result = await commentApi.getReplies({
        parentId,
        rootId,
        page,
        size: REPLY_PAGE_SIZE,
        sort: 'time',
      });
      const normalized = normalize(result.records || []);
      setReplies((prev) => {
        const prevItems = append ? prev[parentId]?.items || [] : [];
        const nextPage = result.current || page;
        const totalPages = result.pages || 1;
        return {
          ...prev,
          [parentId]: {
            items: [...prevItems, ...normalized],
            page: nextPage,
            pages: totalPages,
            loading: false,
            expanded: true,
          },
        };
      });
    } catch (error) {
      console.error('Failed to load replies:', error);
      setReplies((prev) => ({
        ...prev,
        [parentId]: {
          ...(prev[parentId] || { items: [] }),
          loading: false,
          expanded: false,
        },
      }));
    }
  };

  useEffect(() => {
    loadTopComments(1);
    setReplies({});
    setActiveReplyFormId(null);
  }, [postId, momentId]);

  // 处理评论提交（一级）
  const handleSubmit = async (data: CommentFormData) => {
    try {
      await commentApi.submit({
        targetId,
        targetType,
        nickname: data.nickname,
        email: data.email,
        qq: data.qq,
        captcha: data.captcha,
        content: data.content,
      });
      await loadTopComments(1);
      setReplies({});
      return true;
    } catch (error) {
      return false;
    }
  };

  // 打开/关闭回复表单
  const handleReply = (commentId: number) => {
    setActiveReplyFormId((prev) => (prev === commentId ? null : commentId));
  };

  const handleCloseReplyForm = () => setActiveReplyFormId(null);

  // 回复提交成功后刷新对应楼层 + 顶部列表计数
  const handleReplySubmitSuccess = (rootId: number) => {
    loadReplies(rootId, rootId, 1);
    loadTopComments(1);
    setActiveReplyFormId(null);
  };

  const handleToggleReplies = (commentId: number, replyCount?: number) => {
    if (!replyCount) return;
    const current = replies[commentId];
    if (!current || (!current.items.length && replyCount > 0)) {
      loadReplies(commentId, commentId, 1);
      return;
    }
    setReplies((prev) => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        expanded: !prev[commentId].expanded,
      },
    }));
  };

  const handleLoadMoreReplies = (commentId: number) => {
    const state = replies[commentId];
    if (!state) {
      loadReplies(commentId, commentId, 1);
      return;
    }
    if (state.loading) return;
    const nextPage = state.page + 1;
    if (nextPage > state.pages) return;
    loadReplies(commentId, commentId, nextPage, true);
  };

  const hasMoreTop = topPage < topPages;

  return (
    <div className={`anime-comment ${className}`}>
      {showTitle && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold gradient-text mb-2">
            {t('title', { count: topComments.length })}
          </h3>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
        </div>
      )}

      {targetId && (
        <AnimeCommentForm
          config={config}
          targetType={targetType}
          targetId={targetId}
          onSubmit={handleSubmit}
        />
      )}

      {targetId && (
        <AnimeCommentList
          comments={topComments}
          loading={loadingTop}
          loadingMore={loadingMoreTop}
          hasMore={hasMoreTop}
          onLoadMore={() => loadTopComments(topPage + 1, true)}
          onReply={handleReply}
          activeReplyFormId={activeReplyFormId}
          onCloseReplyForm={handleCloseReplyForm}
          onReplySubmitSuccess={handleReplySubmitSuccess}
          onToggleReplies={handleToggleReplies}
          onLoadMoreReplies={handleLoadMoreReplies}
          replies={replies}
          targetType={targetType}
          targetId={targetId}
          config={config}
        />
      )}
    </div>
  );
}

export default function AnimeComment(props: AnimeCommentProps) {
  return (
    <UserInfoProvider>
      <AnimeCommentInner {...props} />
    </UserInfoProvider>
  );
}
