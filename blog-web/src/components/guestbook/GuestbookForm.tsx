'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { guestbookApi } from '@/lib/api/guestbook';
import type { GuestbookVO } from '@/types';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api/auth';
import { clearVerifyToken, getVerifyToken, isVerifyTokenValidForEmail, saveVerifyToken } from '@/lib/auth/emailSession';
import { useUserInfoStore } from '@/store/userInfo';

interface GuestbookFormProps {
  onSuccess?: (message: GuestbookVO) => void;
}

export default function GuestbookForm({ onSuccess }: GuestbookFormProps) {
  const t = useTranslations('comment');
  const tGuestbook = useTranslations('guestbook');

  // 从全局store获取用户信息
  const userInfo = useUserInfoStore();
  const setUserInfo = useUserInfoStore((state) => state.setUserInfo);

  const [content, setContent] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
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

  useEffect(() => {
    const token = getVerifyToken();
    setEmailVerified(isVerifyTokenValidForEmail(token, userInfo.email?.trim() || ''));
  }, [userInfo.email]);

  const handleSendCode = async () => {
    if (!userInfo.email?.trim()) {
      setError(tGuestbook('emailRequired'));
      return;
    }
    setSendingCode(true);
    setError('');
    try {
      await guestbookApi.sendEmailCode(userInfo.email.trim());
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

  const ensureEmailVerified = async () => {
    const trimmedEmail = userInfo.email?.trim() || '';
    const token = getVerifyToken();
    if (isVerifyTokenValidForEmail(token, trimmedEmail)) {
      setEmailVerified(true);
      return true;
    }
    if (!emailCode.trim()) {
      setError(tGuestbook('emailCodeRequired'));
      return false;
    }
    const result = await authApi.verifyEmail(trimmedEmail, emailCode.trim());
    saveVerifyToken(result.token);
    setEmailVerified(true);
    setEmailCode('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.nickname?.trim()) {
      setError(tGuestbook('nicknameRequired'));
      return;
    }
    if (!content.trim()) {
      setError(t('pleaseEnterContent'));
      return;
    }
    if (!userInfo.email?.trim()) {
      setError(tGuestbook('emailRequired'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const ok = await ensureEmailVerified();
      if (!ok) return;

      const message = await guestbookApi.submit({
        nickname: userInfo.nickname.trim(),
        email: userInfo.email.trim(),
        qq: userInfo.qq?.trim() || undefined,
        content: content.trim(),
        emailCode: emailCode.trim() || undefined,
        type: '2',
      });

      // 清空内容，保留用户信息
      setContent('');
      setEmailCode('');

      toast.success(t('commentPublished'));
      onSuccess?.(message);
    } catch (err) {
      // 全局拦截器已经处理了错误提示，这里不需要再设置错误
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-1 relative overflow-hidden">
      {error && (
        <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
          <p className="text-red-600 text-sm font-bold flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </p>
        </div>
      )}
      <div className="space-y-4">
        <div className="group relative">
            <input
            type="text"
            value={userInfo.nickname || ''}
            onChange={(e) => setUserInfo({ nickname: e.target.value })}
            placeholder={tGuestbook('nicknamePlaceholder')}
            required
            className="w-full px-5 py-3.5 border-2 border-primary/10 rounded-2xl bg-white/50 dark:bg-black/10 backdrop-blur-sm focus:outline-none focus:border-primary/40 focus:bg-white/80 dark:focus:bg-black/20 transition-all font-medium placeholder:text-muted-foreground/60 focus:scale-[1.01] origin-left"
            />
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity text-primary/40">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
        </div>

        <div className="group relative">
            <input
            type="email"
            value={userInfo.email || ''}
            onChange={(e) => setUserInfo({ email: e.target.value })}
            placeholder={tGuestbook('emailPlaceholder')}
            required
            className="w-full px-5 py-3.5 border-2 border-primary/10 rounded-2xl bg-white/50 dark:bg-black/10 backdrop-blur-sm focus:outline-none focus:border-primary/40 focus:bg-white/80 dark:focus:bg-black/20 transition-all font-medium placeholder:text-muted-foreground/60 focus:scale-[1.01] origin-left"
            />
        </div>

        <div>
            {emailVerified ? (
            <div className="flex items-center justify-between rounded-2xl border-2 border-green-500/10 bg-green-50/50 px-5 py-3 backdrop-blur-sm">
                <span className="text-sm font-semibold text-green-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t('emailVerified')}
                </span>
                <button
                type="button"
                onClick={() => {
                    clearVerifyToken();
                    setEmailVerified(false);
                }}
                className="text-xs font-bold text-green-600/70 hover:text-green-600 hover:underline px-2 py-1"
                >
                {t('changeOrReverify')}
                </button>
            </div>
            ) : (
            <div className="flex gap-3 items-end">
                <div className="flex-1 group relative">
                    <input
                        type="text"
                        value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value)}
                        placeholder={tGuestbook('emailCodePlaceholder')}
                        className="w-full px-5 py-3.5 border-2 border-primary/10 rounded-2xl bg-white/50 dark:bg-black/10 backdrop-blur-sm focus:outline-none focus:border-primary/40 focus:bg-white/80 dark:focus:bg-black/20 transition-all font-medium placeholder:text-muted-foreground/60 focus:scale-[1.01] origin-left"
                    />
                </div>
                <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || cooldown > 0}
                className="px-5 py-3.5 border-2 border-primary/10 rounded-2xl bg-white/50 hover:bg-primary/5 hover:border-primary/20 text-primary/80 font-bold text-sm transition-all disabled:opacity-50 disabled:hover:bg-transparent min-w-[100px] active:scale-95"
                >
                {cooldown > 0
                    ? `${cooldown}s`
                    : sendingCode
                    ? '...'
                    : tGuestbook('sendCode')}
                </button>
            </div>
            )}
        </div>

        <div className="group relative">
            <input
            type="text"
            value={userInfo.qq || ''}
            onChange={(e) => setUserInfo({ qq: e.target.value })}
            placeholder={tGuestbook('qqPlaceholder')}
            className="w-full px-5 py-3.5 border-2 border-primary/10 rounded-2xl bg-white/50 dark:bg-black/10 backdrop-blur-sm focus:outline-none focus:border-primary/40 focus:bg-white/80 dark:focus:bg-black/20 transition-all font-medium placeholder:text-muted-foreground/60 focus:scale-[1.01] origin-left"
            />
             <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity text-primary/40">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.003 2c-5.522 0-10 4.478-10 10 0 5.523 4.478 10 10 10 5.523 0 10-4.477 10-10 0-5.522-4.477-10-10-10zm4.27 15.655c-.713.635-1.637.75-2.203.242-.23-.206-.217-.55.034-.78.223-.205.58-.22.863.02.13.11.23.116.324.085.122-.04.223-.217.152-.403-.23-.604-.985-.757-1.467-.78-.718-.035-1.462.16-1.98.53-.16.115-.36.108-.508-.027l-1.01-1.02c-.146-.148-.288-.277-.57-.27-.294.008-.476.12-.665.31l-.974.98c-.142.143-.327.18-.515.082-.54-.282-1.397-.47-2.07-.35-.55.097-1.3.468-1.503 1.096-.057.177.037.355.158.397.094.032.196.027.327-.083.284-.24.64-.225.864-.02.25.23.264.574.034.78-.566.508-1.49.393-2.204-.242-.18-.16-.27-.373-.255-.59.015-.224.135-.42.34-.555.26-.17.6-.144.757.06.075.094.202.126.315.08.113-.047.165-.18.125-.297-.43-1.258-1.55-2.096-2.91-2.096-1.64 0-2.97 1.33-2.97 2.97 0 1.638 1.33 2.968 2.97 2.968 1.36 0 2.48-.838 2.91-2.097.04-.116.12-.25.01-.297z" opacity=".5"/></svg>
            </div>
        </div>

        <div className="group relative">
            <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={tGuestbook('messageHint')}
            required
            rows={4}
            className="w-full px-5 py-4 border-2 border-primary/10 rounded-2xl bg-white/50 dark:bg-black/10 backdrop-blur-sm focus:outline-none focus:border-primary/40 focus:bg-white/80 dark:focus:bg-black/20 transition-all resize-none font-medium placeholder:text-muted-foreground/60 focus:scale-[1.01] origin-left"
            />
        </div>
      </div>
      
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary via-primary to-accent text-white rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none transition-all font-bold tracking-wide relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
              {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {tGuestbook('sending')}
                  </>
              ) : (
                  <>
                    {tGuestbook('submit')}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </>
              )}
          </span>
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></span>
        </button>
      </div>
    </form>

  );
}
