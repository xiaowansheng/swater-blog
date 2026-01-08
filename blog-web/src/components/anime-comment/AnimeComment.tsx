'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AnimeCommentProps, AnimeCommentConfig, CommentFormData } from './types';
import { DEFAULT_COMMENT_CONFIG } from './constants';
import AnimeCommentForm from './AnimeCommentForm';
import AnimeCommentList from './AnimeCommentList';
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
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyToName, setReplyToName] = useState<string>('');
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
        parentId: replyTo || undefined,
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

      // 清除回复状态
      setReplyTo(null);
      setReplyToName('');

      return true;
    } catch (error) {
      console.error('Failed to submit comment:', error);
      return false;
    }
  };

  // 处理回复
  const handleReply = (commentId: number, nickname: string) => {
    setReplyTo(commentId);
    setReplyToName(nickname);
    // 滚动到表单
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // 取消回复
  const handleCancelReply = () => {
    setReplyTo(null);
    setReplyToName('');
  };

  return (
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
      <AnimeCommentForm
        config={config}
        replyTo={replyTo}
        replyToName={replyToName}
        targetType={targetType}
        targetId={targetId}
        onCancelReply={handleCancelReply}
        onSubmit={handleSubmit}
      />

      {/* 评论列表 */}
      <AnimeCommentList
        comments={comments}
        loading={loading}
        onReply={handleReply}
        config={config}
      />
    </div>
  );
}
