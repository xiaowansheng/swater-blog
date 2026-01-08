'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { guestbookApi } from '@/lib/api/guestbook';
import type { GuestbookVO } from '@/types';
import toast from 'react-hot-toast';

interface GuestbookFormProps {
  onSuccess?: (message: GuestbookVO) => void;
}

export default function GuestbookForm({ onSuccess }: GuestbookFormProps) {
  const t = useTranslations('comment');
  const tGuestbook = useTranslations('guestbook');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [qq, setQq] = useState('');
  const [content, setContent] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');

  // 初始化倒计时状态
  useEffect(() => {
    const savedEndTime = localStorage.getItem('emailCodeEndTime');
    if (savedEndTime) {
      const endTime = parseInt(savedEndTime, 10);
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      if (remaining > 0) {
        setCooldown(remaining);
      } else {
        localStorage.removeItem('emailCodeEndTime');
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      localStorage.removeItem('emailCodeEndTime');
      return;
    }
    
    const timer = window.setInterval(() => {
      setCooldown((prev) => {
        const newValue = prev > 0 ? prev - 1 : 0;
        if (newValue <= 0) {
          localStorage.removeItem('emailCodeEndTime');
        }
        return newValue;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError(tGuestbook('emailRequired'));
      return;
    }
    setSendingCode(true);
    setError('');
    try {
      await guestbookApi.sendEmailCode(email.trim());
      toast.success(tGuestbook('emailCodeSent'));
      // 保存倒计时结束时间到 localStorage
      const endTime = Date.now() + 60 * 1000; // 60秒后
      localStorage.setItem('emailCodeEndTime', endTime.toString());
      setCooldown(60);
    } catch (err) {
      // 全局拦截器已经处理了错误提示，这里不需要再设置错误
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError(tGuestbook('nicknameRequired'));
      return;
    }
    if (!content.trim()) {
      setError('Please enter content');
      return;
    }
    if (!email.trim()) {
      setError(tGuestbook('emailRequired'));
      return;
    }
    if (!emailCode.trim()) {
      setError(tGuestbook('emailCodeRequired'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const message = await guestbookApi.submit({
        nickname: nickname.trim(),
        email: email.trim(),
        qq: qq.trim() || undefined,
        content: content.trim(),
        emailCode: emailCode.trim(),
        type: '2',
      });
      setNickname('');
      setEmail('');
      setQq('');
      setContent('');
      setEmailCode('');
      toast.success(t('success'));
      onSuccess?.(message);
    } catch (err) {
      // 全局拦截器已经处理了错误提示，这里不需要再设置错误
    } finally {
      setSubmitting(false);
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
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              placeholder={tGuestbook('emailCodePlaceholder')}
              required
              className="w-full px-5 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
            />
          </div>
          <button
            type="button"
            onClick={handleSendCode}
            disabled={sendingCode || cooldown > 0}
            className="px-4 py-3 border border-border rounded-xl hover:bg-muted/50 transition-all text-sm disabled:opacity-50"
          >
            {cooldown > 0
              ? tGuestbook('resendCode', { seconds: cooldown })
              : sendingCode
                ? tGuestbook('sendingCode')
                : tGuestbook('sendCode')}
          </button>
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
          disabled={submitting}
          className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 transition-all font-medium relative overflow-hidden group"
        >
          <span className="relative z-10">{submitting ? t('loading') || 'Loading...' : t('submit')}</span>
          {!submitting && (
            <span className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
          )}
        </button>
      </div>
    </form>
  );
}
