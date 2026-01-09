'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AnimeCommentProps, AnimeCommentConfig, CommentFormData } from './types';
import { DEFAULT_COMMENT_CONFIG } from './constants';
import AnimeCommentForm from './AnimeCommentForm';
import AnimeCommentList from './AnimeCommentList';
import { UserInfoProvider } from './UserInfoContext';
import { commentApi } from '@/lib/api/comment';

/**
 * 二次元评论容器组件
 */
export default function AnimeComment({
  postId,
  momentId,
  config: userConfig,
  showTitle = true,
  className = '',
}: AnimeCommentProps) {
  const t = useTranslations('comment');
  const [config, setConfig] = useState<AnimeCommentConfig>(DEFAULT_COMMENT_CONFIG);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeReplyFormId, setActiveReplyFormId] = useState<number | null>(null);
  const targetType: CommentFormData['targetType'] = postId ? 'ARTICLE' : 'TALK';
  const targetId = postId ?? momentId;

  // 加载评论配置
  useEffect(() => {
    // TODO: 从API加载评论配置
    // const loadConfig = async () => {
    //   const siteConfig = await getPublicConfig();
    //   setConfig({ ...DEFAULT_COMMENT_CONFIG, ...siteConfig.comment, ...userConfig });
    // };
    // loadConfig();

    // 临时使用传入配置或默认配置
    setConfig({ ...DEFAULT_COMMENT_CONFIG, ...userConfig });
  }, [userConfig]);

  // 加载评论列表
  useEffect(() => {
    if (!targetId) return;

    const loadComments = async () => {
      setLoading(true);
      try {
        const result = await commentApi.getList({
          targetId,
          targetType,
          page: 1,
          size: 100,
        });
        setComments(result.records || []);
      } catch (error) {
        console.error('Failed to load comments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [postId, momentId]);

  // 处理评论提交
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

      // 重新加载评论列表
      const result = await commentApi.getList({
        targetId,
        targetType,
        page: 1,
        size: 100,
      });
      setComments(result.records || []);

      return true;
    } catch (error) {
      // 全局拦截器已经处理了错误提示
      return false;
    }
  };

  // 处理回复（打开回复表单）
  const handleReply = (commentId: number) => {
    // 如果点击的是当前已展开的评论，则关闭
    if (activeReplyFormId === commentId) {
      setActiveReplyFormId(null);
    } else {
      // 否则，展开该评论的回复表单（自动关闭其他）
      setActiveReplyFormId(commentId);
    }
  };

  // 关闭回复表单
  const handleCloseReplyForm = () => {
    setActiveReplyFormId(null);
  };

  // 回复提交成功后的回调
  const handleReplySubmitSuccess = () => {
    // 重新加载评论列表
    commentApi.getList({
      targetId,
      targetType,
      page: 1,
      size: 100,
    }).then(result => {
      setComments(result.records || []);
    });
    // 关闭回复表单
    setActiveReplyFormId(null);
  };

  return (
    <UserInfoProvider>
      <div className={`anime-comment ${className}`}>
      {showTitle && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold gradient-text mb-2">
            {t('title', { count: comments.length })}
          </h3>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
        </div>
      )}

      {/* 评论表单 */}
      {targetId && (
        <AnimeCommentForm
          config={config}
          targetType={targetType}
          targetId={targetId}
          onSubmit={handleSubmit}
        />
      )}

      {/* 评论列表 */}
      {targetId && (
        <AnimeCommentList
          comments={comments}
          loading={loading}
          onReply={handleReply}
          activeReplyFormId={activeReplyFormId}
          onCloseReplyForm={handleCloseReplyForm}
          onReplySubmitSuccess={handleReplySubmitSuccess}
          targetType={targetType}
          targetId={targetId}
          config={config}
        />
      )}
    </div>
    </UserInfoProvider>
  );
}
