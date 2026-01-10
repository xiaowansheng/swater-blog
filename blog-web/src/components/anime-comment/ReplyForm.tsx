'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import EmojiPicker from './EmojiPicker';
import { commentApi } from '@/lib/api/comment';
import { authApi } from '@/lib/api/auth';
import { clearVerifyToken, getVerifyToken, isVerifyTokenValidForEmail, saveVerifyToken } from '@/lib/auth/emailSession';
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
  const [emailVerified, setEmailVerified] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const normalizedEmail = useMemo(() => userInfo.email?.trim() || '', [userInfo.email]);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

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
      toast.error('请输入回复内容');
      return;
    }

    setSubmitting(true);
    try {
      if (!(await ensureEmailVerified())) return;

      await commentApi.submit({
        targetId,
        targetType,
        parentId,
        rootId,
        nickname: userInfo.nickname,
        email: normalizedEmail,
        qq: userInfo.qq,
        content,
      });

      toast.success('回复发布成功');
      setContent('');
      setImages([]);
      setPreviewImages((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSubmitSuccess(rootId);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 ml-8 md:ml-12">
      <div className="bg-gradient-to-br from-pink-50/80 to-purple-50/80 backdrop-blur-sm rounded-3xl p-5 border-2 border-pink-100/50 shadow-lg">
        <div className="mb-4 p-3 bg-pink-100/80 rounded-xl flex items-center justify-between">
          <div className="text-pink-700 text-sm font-medium">正在回复 {parentNickname}</div>
          <button type="button" onClick={onCancel} className="text-pink-600 hover:text-pink-800">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              ref={textareaRef}
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的回复..."
              className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/80 min-h-[100px] resize-none"
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
                    className="p-2 rounded-lg hover:bg-pink-50 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                    title="添加图片"
                  >
                    <svg className="w-6 h-6 text-pink-400 group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-full border border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:from-pink-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '提交中...' : '发布回复'}
              </button>
            </div>
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
                    title="删除"
                  >
                    ×
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

