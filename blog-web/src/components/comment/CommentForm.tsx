'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { commentApi } from '@/lib/api/comment';

interface CommentFormProps {
  targetId?: number;
  targetType?: 'ARTICLE' | 'TALK';
  parentId?: number;
  onSuccess?: () => void;
}

export default function CommentForm({
  targetId,
  targetType,
  parentId,
  onSuccess,
}: CommentFormProps) {
  const t = useTranslations('comment');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [qq, setQq] = useState('');
  const [content, setContent] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取验证码
  const fetchCaptcha = async () => {
    try {
      const response = await commentApi.getCaptcha();
      setCaptchaImage(response.image);
      setCaptchaKey(response.key);
      setCaptcha('');
    } catch (err) {
      console.error('Failed to fetch captcha:', err);
    }
  };

  // 组件加载时获取验证码
  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !email.trim() || !content.trim() || !captcha.trim()) {
      setError('Please fill in required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await commentApi.submit({
        targetId,
        targetType,
        parentId,
        nickname: nickname.trim(),
        email: email.trim(),
        qq: qq.trim() || undefined,
        content: content.trim(),
        captcha: `${captchaKey}:${captcha.trim()}`,
      });
      setNickname('');
      setEmail('');
      setQq('');
      setContent('');
      setCaptcha('');
      fetchCaptcha(); // 重新获取验证码
      onSuccess?.();
    } catch (err) {
      setError(t('error'));
      fetchCaptcha(); // 验证失败时重新获取验证码
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 modern-card p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-30"></div>
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-800 rounded-xl shadow-sm">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        </div>
      )}
      <div>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t('namePlaceholder')}
          required
          className="w-full px-5 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
        />
      </div>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          required
          className="w-full px-5 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
        />
      </div>
      <div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <input
              type="text"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              placeholder={t('captchaPlaceholder')}
              required
              className="w-full px-5 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
            />
          </div>
          <div className="flex items-center gap-2">
            {captchaImage && (
              <img
                src={`data:image/png;base64,${captchaImage}`}
                alt={t('captcha')}
                className="h-12 border border-border rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={fetchCaptcha}
                title={t('refreshCaptcha')}
              />
            )}
            <button
              type="button"
              onClick={fetchCaptcha}
              className="px-3 py-3 border border-border rounded-xl hover:bg-muted/50 transition-all"
              title={t('refreshCaptcha')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div>
        <input
          type="text"
          value={qq}
          onChange={(e) => setQq(e.target.value)}
          placeholder={t('qqPlaceholder')}
          className="w-full px-5 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
        />
      </div>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('placeholder')}
          required
          rows={4}
          className="w-full px-5 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none shadow-sm focus:shadow-md"
        />
      </div>
      <div className="flex gap-3 justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 transition-all font-medium relative overflow-hidden group"
        >
          <span className="relative z-10">{loading ? t('loading') || 'Loading...' : t('submit')}</span>
          {!loading && (
            <span className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
          )}
        </button>
        {parentId && (
          <button
            type="button"
            onClick={onSuccess}
            className="px-6 py-3 border border-border rounded-xl hover:bg-gradient-to-r hover:from-secondary hover:to-secondary/50 transition-all font-medium"
          >
            {t('cancel')}
          </button>
        )}
      </div>
    </form>
  );
}

