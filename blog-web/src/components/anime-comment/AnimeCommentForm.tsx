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
import { Card } from '@/components/ui/Card';
import { compressImageIfNeeded } from '@/lib/utils/imageCompress';

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

  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

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
      toast.error(t('pleaseEnterEmail'));
      return;
    }
    setSendingCode(true);
    try {
      await commentApi.sendEmailCode(normalizedEmail);
      toast.success(t('verificationCodeSent'));
      const endTime = Date.now() + 60 * 1000;
      localStorage.setItem('commentEmailCodeEndTime', endTime.toString());
      setCooldown(60);
    } finally {
      setSendingCode(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > config.maxImageSize * 1024 * 1024) {
        toast.error(t('imageSizeTooLarge', { size: config.maxImageSize }));
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(t('onlyImagesAllowed'));
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > config.maxImages) {
      toast.error(t('maxImagesExceeded', { count: config.maxImages }));
      return;
    }

    const processedFiles = await Promise.all(
      validFiles.map((file) => compressImageIfNeeded(file))
    );
    const nextImages = [...images, ...processedFiles];
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
      toast.error(t('pleaseEnterVerificationCode'));
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
      toast.error(t('pleaseEnterNickname'));
      return;
    }
    if (!normalizedEmail) {
      toast.error(t('pleaseEnterEmail'));
      return;
    }
    if (!content.trim()) {
      toast.error(t('pleaseEnterContent'));
      return;
    }
    if (!targetId) {
      toast.error(t('missingTargetInfo'));
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
        toast.success(t('commentPublished'));
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
      <Card className="p-6 md:p-8 relative overflow-hidden" hoverEffect={false}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-30"></div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="nickname"
              value={userInfo.nickname}
              onChange={(e) => updateUserInfo({ nickname: e.target.value })}
              placeholder={t('nicknamePlaceholder')}
              className="flex-1 px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
              maxLength={50}
            />
            <input
              type="text"
              name="qq"
              value={userInfo.qq}
              onChange={(e) => updateUserInfo({ qq: e.target.value })}
              placeholder={t('qqPlaceholder')}
              className="flex-1 px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
              maxLength={50}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              name="email"
              value={userInfo.email}
              onChange={(e) => updateUserInfo({ email: e.target.value })}
              placeholder={t('emailPlaceholder')}
              className="flex-1 px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
              maxLength={100}
              required
            />

            <div className="flex-1">
              {emailVerified ? (
                <div className="h-full flex items-center justify-between rounded-xl border border-border bg-card/50 px-4 py-3">
                  <span className="text-sm text-primary/80">{t('emailVerified')}</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearVerifyToken();
                      setEmailVerified(false);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    {t('changeOrReverify')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="captcha"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    placeholder={t('verificationCodePlaceholder')}
                    className="flex-1 px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    disabled={sendingCode || cooldown > 0 || !normalizedEmail}
                    className="px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm whitespace-nowrap"
                  >
                    {cooldown > 0 ? `${cooldown}s` : sendingCode ? t('sending') : t('sendCode')}
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
              className="w-full px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none shadow-sm focus:shadow-md min-h-[120px]"
              maxLength={1000}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-0">
              {config.allowImage && (
                <>
                  <EmojiPicker onEmojiSelect={handleInsertEmoji} />
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
                    className="p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t('addImage')}
                  >
                    <svg className="w-6 h-6 text-primary group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-medium hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? t('submitting') : t('publishComment')}
            </button>
          </div>

          {config.allowImage && previewImages.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {previewImages.map((url, idx) => (
                <div key={url} className="relative">
                  <img src={url} alt={`preview-${idx}`} className="w-20 h-20 object-cover rounded-xl border" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs"
                    title={t('remove')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </form>
  );
}
