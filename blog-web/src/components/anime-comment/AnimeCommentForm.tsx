'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import EmojiPicker from './EmojiPicker';
import type { AnimeCommentConfig, CommentFormData } from './types';
import { commentApi } from '@/lib/api/comment';
import { authApi } from '@/lib/api/auth';
import { clearVerifyToken, getVerifyToken, isVerifyTokenValidForEmail, saveVerifyToken } from '@/lib/auth/emailSession';
import { useUserInfo } from './UserInfoContext';

interface AnimeCommentFormProps {
  config: AnimeCommentConfig;
  targetType: 'ARTICLE' | 'TALK';
  targetId?: number;
  onSubmit: (data: CommentFormData) => Promise<boolean>;
}

export default function AnimeCommentForm({ config, targetType, targetId, onSubmit }: AnimeCommentFormProps) {
  const t = useTranslations('comment');
  const { userInfo, updateUserInfo } = useUserInfo();

  const [content, setContent] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizedEmail = useMemo(() => userInfo.email?.trim() || '', [userInfo.email]);

  useEffect(() => {
    const savedEndTime = localStorage.getItem('commentEmailCodeEndTime');
    if (!savedEndTime) return;
    const endTime = parseInt(savedEndTime, 10);
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    if (remaining > 0) setCooldown(remaining);
    else localStorage.removeItem('commentEmailCodeEndTime');
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      localStorage.removeItem('commentEmailCodeEndTime');
      return;
    }
    const timer = window.setInterval(() => {
      setCooldown((prev) => {
        const next = prev > 0 ? prev - 1 : 0;
        if (next <= 0) localStorage.removeItem('commentEmailCodeEndTime');
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    const token = getVerifyToken();
    setEmailVerified(isVerifyTokenValidForEmail(token, normalizedEmail));
  }, [normalizedEmail]);

  const handleInsertEmoji = (emoji: string) => setContent((prev) => prev + emoji);

  const handleSendEmailCode = async () => {
    if (!normalizedEmail) {
      toast.error('请输入邮箱地址');
      return;
    }
    setSendingCode(true);
    try {
      await commentApi.sendEmailCode(normalizedEmail);
      toast.success('验证码已发送到您的邮箱');
      const endTime = Date.now() + 60 * 1000;
      localStorage.setItem('commentEmailCodeEndTime', endTime.toString());
      setCooldown(60);
    } finally {
      setSendingCode(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
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

    const nextImages = [...images, ...validFiles];
    setImages(nextImages);

    const nextPreviews = nextImages.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return nextPreviews;
    });
  };

  const handleRemoveImage = (index: number) => {
    const nextImages = images.filter((_, i) => i !== index);
    setImages(nextImages);
    setPreviewImages((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return nextImages.map((file) => URL.createObjectURL(file));
    });
  };

  const ensureEmailVerified = async () => {
    const token = getVerifyToken();
    if (isVerifyTokenValidForEmail(token, normalizedEmail)) {
      setEmailVerified(true);
      return true;
    }
    if (!captcha.trim()) {
      toast.error('请输入邮箱验证码');
      return false;
    }
    const result = await authApi.verifyEmail(normalizedEmail, captcha.trim());
    saveVerifyToken(result.token);
    setEmailVerified(true);
    setCaptcha('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInfo.nickname?.trim()) {
      toast.error('请输入昵称');
      return;
    }
    if (!normalizedEmail) {
      toast.error('请输入邮箱地址');
      return;
    }
    if (!content.trim()) {
      toast.error('请输入评论内容');
      return;
    }
    if (!targetId) {
      toast.error('缺少评论目标信息，请刷新后重试');
      return;
    }

    setSubmitting(true);
    try {
      if (!(await ensureEmailVerified())) return;

      const success = await onSubmit({
        nickname: userInfo.nickname,
        email: normalizedEmail,
        qq: userInfo.qq,
        content,
        targetType,
        targetId,
        images,
      });

      if (success) {
        toast.success('评论发布成功');
        setContent('');
        setCaptcha('');
        setImages([]);
        setPreviewImages((prev) => {
          prev.forEach((url) => URL.revokeObjectURL(url));
          return [];
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id="comment-form" onSubmit={handleSubmit} className="mb-12">
      <div className="bg-gradient-to-br from-pink-50/80 to-purple-50/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border-2 border-pink-100/50 shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="nickname"
              value={userInfo.nickname}
              onChange={(e) => updateUserInfo({ nickname: e.target.value })}
              placeholder="昵称 *"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80"
              maxLength={50}
            />
            <input
              type="text"
              name="qq"
              value={userInfo.qq}
              onChange={(e) => updateUserInfo({ qq: e.target.value })}
              placeholder="QQ（可选）"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80"
              maxLength={50}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              name="email"
              value={userInfo.email}
              onChange={(e) => updateUserInfo({ email: e.target.value })}
              placeholder="邮箱 *"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80"
              maxLength={100}
              required
            />

            <div className="flex-1">
              {emailVerified ? (
                <div className="h-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-green-200 bg-white/80">
                  <span className="text-sm text-green-700">邮箱已验证</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearVerifyToken();
                      setEmailVerified(false);
                    }}
                    className="text-xs text-pink-600 hover:text-pink-700"
                  >
                    更换/重新验证
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="captcha"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    placeholder="邮箱验证码 *"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    disabled={sendingCode || cooldown > 0 || !normalizedEmail}
                    className="px-4 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                  >
                    {cooldown > 0 ? `${cooldown}s` : sendingCode ? '发送中...' : '发送验证码'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('placeholder') || '写下你的评论...'}
              className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80 min-h-[120px] resize-none"
              maxLength={1000}
            />
          </div>

          {config.allowImage && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= config.maxImages}
                  className="px-4 py-2 rounded-xl border border-pink-200 text-pink-600 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加图片
                </button>
                <EmojiPicker onEmojiSelect={handleInsertEmoji} />
              </div>

              {previewImages.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {previewImages.map((url, idx) => (
                    <div key={url} className="relative">
                      <img src={url} alt={`preview-${idx}`} className="w-20 h-20 object-cover rounded-xl border" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs"
                        title="删除"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '提交中...' : '发布评论'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

