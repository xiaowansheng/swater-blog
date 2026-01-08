'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AnimeCommentConfig, CommentFormData } from './types';
import EmojiPicker from './EmojiPicker';

interface AnimeCommentFormProps {
  config: AnimeCommentConfig;
  replyTo?: number | null;
  replyToName?: string;
  targetType: 'ARTICLE' | 'TALK';
  targetId?: number;
  onCancelReply: () => void;
  onSubmit: (data: CommentFormData) => Promise<boolean>;
}

/**
 * 二次元评论表单组件
 */
export default function AnimeCommentForm({
  config,
  replyTo,
  replyToName,
  targetType,
  targetId,
  onCancelReply,
  onSubmit,
}: AnimeCommentFormProps) {
  const t = useTranslations('comment');
  const [formData, setFormData] = useState<CommentFormData>({
    nickname: '',
    email: '',
    qq: '',
    captcha: '',
    content: '',
    targetType,
    targetId,
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 从本地存储加载用户信息
  useEffect(() => {
    const savedNickname = localStorage.getItem('comment_nickname');
    const savedEmail = localStorage.getItem('comment_email');
    const savedQQ = localStorage.getItem('comment_qq');
    if (savedNickname || savedEmail || savedQQ) {
      setFormData(prev => ({
        ...prev,
        nickname: savedNickname || '',
        email: savedEmail || '',
        qq: savedQQ || '',
      }));
    }
  }, []);

  // keep target info in sync
  useEffect(() => {
    setFormData(prev => ({ ...prev, targetType, targetId }));
  }, [targetType, targetId]);

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 插入表情
  const handleInsertEmoji = (emoji: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + emoji,
    }));
  };

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > config.maxImageSize * 1024 * 1024) {
        alert(`图片大小不能超过 ${config.maxImageSize}MB`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert('只能上传图片文件');
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > config.maxImages) {
      alert(`最多只能上传 ${config.maxImages} 张图片`);
      return;
    }

    setImages(prev => [...prev, ...validFiles]);

    // 生成预览URL
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证
    if (!formData.nickname.trim()) {
      alert('请输入昵称');
      return;
    }

    if (!formData.content.trim()) {
      alert('请输入评论内容');
      return;
    }

    if (!formData.targetId) {
      alert('缺少评论目标信息，请刷新后重试');
      return;
    }

    if (!formData.captcha?.trim()) {
      alert('请输入验证码');
      return;
    }

    setSubmitting(true);

    try {
      const success = await onSubmit({ ...formData, images });
      if (success) {
        // 保存用户信息到本地存储
        localStorage.setItem('comment_nickname', formData.nickname);
        if (formData.email) {
          localStorage.setItem('comment_email', formData.email);
        }
        if (formData.qq) {
          localStorage.setItem('comment_qq', formData.qq);
        }

        // 重置表单
        setFormData(prev => ({
          ...prev,
          content: '',
          captcha: '',
        }));
        setImages([]);
        setPreviewImages([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const targetLabel = targetType === 'ARTICLE' ? '文章' : '说说';

  return (
    <form id="comment-form" onSubmit={handleSubmit} className="mb-12">
      <div className="bg-gradient-to-br from-pink-50/80 to-purple-50/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border-2 border-pink-100/50 shadow-lg relative overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute top-4 right-4 text-4xl opacity-20 animate-float">✨</div>
        <div className="absolute bottom-4 left-4 text-3xl opacity-20 animate-float-delay">❀</div>

        {/* 评论目标信息 */}
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-purple-700">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100/80 border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            评论类型：{targetLabel}
          </span>
          {targetId && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-100/80 border border-pink-200">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              目标ID：{targetId}
            </span>
          )}
        </div>

        {/* 回复提示 */}
        {replyTo && (
          <div className="mb-4 p-3 bg-purple-100/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span className="font-medium">正在回复 {replyToName}</span>
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              className="text-purple-600 hover:text-purple-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* 输入框区域 */}
        <div className="space-y-4">
          {/* 基础信息 */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="昵称 *"
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80 backdrop-blur-sm"
                maxLength={50}
              />
            </div>
            <div className="flex-1">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="邮箱"
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80 backdrop-blur-sm"
                maxLength={100}
              />
            </div>
          </div>

          {/* 其他用户信息 */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="qq"
                value={formData.qq}
                onChange={handleChange}
                placeholder="QQ（可选）"
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80 backdrop-blur-sm"
                maxLength={50}
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                name="captcha"
                value={formData.captcha}
                onChange={handleChange}
                placeholder="验证码"
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80 backdrop-blur-sm"
                maxLength={20}
                required
              />
            </div>
          </div>

          {/* 评论区 */}
          <div>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="写下你的评论... ✨"
              className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80 backdrop-blur-sm min-h-[120px] resize-none"
              maxLength={1000}
            />
          </div>

          {/* 工具栏和提交按钮 */}
          <div className="flex items-center justify-between gap-3">
            {/* 左侧：表情按钮和图片上传按钮 */}
            <div className="flex items-center gap-2">
              <EmojiPicker onEmojiSelect={handleInsertEmoji} />

              {/* 图片上传按钮 */}
              {config.allowImage && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length >= config.maxImages}
                    className="p-2 rounded-lg hover:bg-pink-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="上传图片"
                  >
                    <svg className="w-6 h-6 text-pink-400 group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* 右侧：提交按钮 */}
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {submitting ? '发送中...' : '发送评论 ✨'}
            </button>
          </div>

          {/* 图片预览 */}
          {previewImages.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {previewImages.map((src, index) => (
                <div key={index} className="relative group">
                  <img
                    src={src}
                    alt={`预览 ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-xl border-2 border-pink-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
