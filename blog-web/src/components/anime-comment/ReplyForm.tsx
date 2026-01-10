'use client';

import { useState, useRef, useEffect } from 'react';
import EmojiPicker from './EmojiPicker';
import toast from 'react-hot-toast';
import { commentApi } from '@/lib/api/comment';
import { useUserInfo } from './UserInfoContext';

interface ReplyFormProps {
  parentId: number;
  rootId: number;
  parentNickname: string;
  targetType: 'ARTICLE' | 'TALK';
  targetId: number;
  config: any;
  onSubmitSuccess: (rootId: number) => void;
  onCancel: () => void;
}

/**
 * 回复表单组件（完整版，包含所有字段）
 */
export default function ReplyForm({
  parentId,
  rootId,
  parentNickname,
  targetType,
  targetId,
  config,
  onSubmitSuccess,
  onCancel,
}: ReplyFormProps) {
  const { userInfo, updateUserInfo } = useUserInfo();
  const [content, setContent] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动聚焦到内容输入框
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  // 初始化倒计时状态
  useEffect(() => {
    const savedEndTime = localStorage.getItem('commentEmailCodeEndTime');
    if (savedEndTime) {
      const endTime = parseInt(savedEndTime, 10);
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      if (remaining > 0) {
        setCooldown(remaining);
      } else {
        localStorage.removeItem('commentEmailCodeEndTime');
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      localStorage.removeItem('commentEmailCodeEndTime');
      return;
    }

    const timer = window.setInterval(() => {
      setCooldown((prev) => {
        const newValue = prev > 0 ? prev - 1 : 0;
        if (newValue <= 0) {
          localStorage.removeItem('commentEmailCodeEndTime');
        }
        return newValue;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // 更新用户信息（基本信息字段）
    if (name === 'nickname' || name === 'email' || name === 'qq') {
      updateUserInfo({ [name]: value });
    }
    // 更新其他字段
    else if (name === 'content') {
      setContent(value);
    } else if (name === 'captcha') {
      setCaptcha(value);
    }
  };

  // 插入表情
  const handleInsertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  // 发送邮箱验证码
  const handleSendEmailCode = async () => {
    if (!userInfo.email?.trim()) {
      toast.error('请输入邮箱地址');
      return;
    }
    setSendingCode(true);
    try {
      await commentApi.sendEmailCode(userInfo.email.trim());
      toast.success('验证码已发送到您的邮箱');
      const endTime = Date.now() + 60 * 1000;
      localStorage.setItem('commentEmailCodeEndTime', endTime.toString());
      setCooldown(60);
    } catch (err) {
      // 全局拦截器已经处理了错误提示
    } finally {
      setSendingCode(false);
    }
  };

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > config.maxImageSize * 1024 * 1024) {
        toast.error(`图片大小不能超过 ${config.maxImageSize}MB`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('只能上传图片文件');
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > config.maxImages) {
      toast.error(`最多只能上传 ${config.maxImages} 张图片`);
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

  // 提交回复
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证
    if (!userInfo.nickname?.trim()) {
      toast.error('请输入昵称');
      return;
    }

    if (!userInfo.email?.trim()) {
      toast.error('请输入邮箱地址');
      return;
    }

    if (!content.trim()) {
      toast.error('请输入回复内容');
      return;
    }

    if (!captcha?.trim()) {
      toast.error('请输入邮箱验证码');
      return;
    }

    setSubmitting(true);

    try {
      await commentApi.submit({
        targetId,
        targetType,
        parentId,
        rootId,
        nickname: userInfo.nickname,
        email: userInfo.email,
        qq: userInfo.qq,
        captcha,
        content,
      });

      toast.success('回复发布成功！');
      onSubmitSuccess(rootId);
    } catch (error) {
      // 全局拦截器已经处理了错误提示
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 ml-8 md:ml-12">
      <div className="bg-gradient-to-br from-pink-50/80 to-purple-50/80 backdrop-blur-sm rounded-3xl p-5 border-2 border-pink-100/50 shadow-lg relative overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute top-2 right-2 text-2xl opacity-20 animate-float">✨</div>
        <div className="absolute bottom-2 left-2 text-xl opacity-20 animate-float-delay">❀</div>

        {/* 回复提示 */}
        <div className="mb-4 p-3 bg-pink-100/80 rounded-xl flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 text-pink-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="font-medium">正在回复 {parentNickname}</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-pink-600 hover:text-pink-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* 基础信息 */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="nickname"
                value={userInfo.nickname}
                onChange={handleChange}
                placeholder="昵称 *"
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80 backdrop-blur-sm"
                maxLength={50}
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                name="qq"
                value={userInfo.qq}
                onChange={handleChange}
                placeholder="QQ（可选）"
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80 backdrop-blur-sm"
                maxLength={50}
              />
            </div>
          </div>

          {/* 邮箱和验证码 */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="email"
                name="email"
                value={userInfo.email}
                onChange={handleChange}
                placeholder="邮箱 *"
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80 backdrop-blur-sm"
                maxLength={100}
                required
              />
            </div>
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="captcha"
                  value={captcha}
                  onChange={handleChange}
                  placeholder="邮箱验证码"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80 backdrop-blur-sm"
                  maxLength={20}
                  required
                />
                <button
                  type="button"
                  onClick={handleSendEmailCode}
                  disabled={sendingCode || cooldown > 0 || !userInfo.email?.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                >
                  {cooldown > 0
                    ? `${cooldown}s`
                    : sendingCode
                      ? '发送中...'
                      : '发送验证码'}
                </button>
              </div>
            </div>
          </div>

          {/* 回复内容 */}
          <div>
            <textarea
              ref={textareaRef}
              name="content"
              value={content}
              onChange={handleChange}
              placeholder="写下你的回复... ✨"
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
              {submitting ? '发送中...' : '发送回复 ✨'}
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
        </form>
      </div>
    </div>
  );
}
