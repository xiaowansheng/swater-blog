'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { friendLinkApi } from '@/lib/api/friendLink';
import { guestbookApi } from '@/lib/api/guestbook';
import { authApi } from '@/lib/api/auth';
import type { FriendLinkApplicationDTO } from '@/types';
import toast from 'react-hot-toast';
import { clearVerifyToken, getVerifyToken, isVerifyTokenValidForEmail, saveVerifyToken } from '@/lib/auth/emailSession';
import { useUserInfoStore } from '@/store/userInfo';

interface FriendLinkApplicationFormProps {
  onSuccess?: () => void;
}

export default function FriendLinkApplicationForm({
  onSuccess,
}: FriendLinkApplicationFormProps) {
  const t = useTranslations('friendLinkForm');
  // 从全局store获取用户信息
  const userInfo = useUserInfoStore();
  const setUserInfo = useUserInfoStore((state) => state.setUserInfo);

  const [formData, setFormData] = useState<FriendLinkApplicationDTO>({
    name: '',
    author: userInfo.nickname || '',
    url: '',
    logo: '',
    description: '',
    email: userInfo.email || '',
  });
  const [emailCode, setEmailCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    const trimmedEmail = formData.email?.trim() || '';
    setEmailVerified(isVerifyTokenValidForEmail(token, trimmedEmail));
  }, [formData.email]);

  const handleSendCode = async () => {
    const trimmedEmail = formData.email?.trim() || '';
    if (!trimmedEmail) {
      setError(t('pleaseEnterEmail'));
      return;
    }
    setSendingCode(true);
    setError('');
    try {
      await guestbookApi.sendEmailCode(trimmedEmail);
      toast.success(t('verificationCodeSent'));
      const endTime = Date.now() + 60 * 1000;
      localStorage.setItem('emailCodeEndTime', endTime.toString());
      setCooldown(60);
    } catch (err) {
    } finally {
      setSendingCode(false);
    }
  };

  const ensureEmailVerified = async () => {
    const trimmedEmail = formData.email?.trim() || '';
    const token = getVerifyToken();
    if (isVerifyTokenValidForEmail(token, trimmedEmail)) {
      setEmailVerified(true);
      return true;
    }
    if (!emailCode.trim()) {
      setError(t('pleaseEnterVerificationCode'));
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

    if (!formData.name.trim()) {
      setError(t('pleaseEnterSiteName'));
      return;
    }
    if (!formData.author.trim()) {
      setError(t('pleaseEnterNickname'));
      return;
    }
    if (!formData.url.trim()) {
      setError(t('pleaseEnterSiteUrl'));
      return;
    }
    if (!formData.email?.trim()) {
      setError(t('pleaseEnterEmail'));
      return;
    }
    if (!formData.description?.trim()) {
      setError(t('pleaseEnterSiteDescription'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const ok = await ensureEmailVerified();
      if (!ok) return;

      await friendLinkApi.apply({
        name: formData.name.trim(),
        author: formData.author.trim(),
        url: formData.url.trim(),
        logo: formData.logo?.trim() || undefined,
        description: formData.description.trim(),
        email: formData.email.trim(),
        emailCode: emailCode.trim() || undefined,
      });
      setSuccess(true);
      setFormData({
        name: '',
        author: userInfo.nickname || '',
        url: '',
        logo: '',
        description: '',
        email: userInfo.email || '',
      });
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('submitFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-5 pr-2">
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

        {success && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-800 rounded-xl shadow-sm">
            <p className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('applicationSuccess')}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {t('siteName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('siteNamePlaceholder')}
            required
            className="w-full px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {t('siteUrl')} <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder={t('siteUrlPlaceholder')}
            required
            className="w-full px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {t('yourNickname')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => {
              const newAuthor = e.target.value;
              setFormData({ ...formData, author: newAuthor });
              setUserInfo({ nickname: newAuthor });
            }}
            placeholder={t('nicknamePlaceholder')}
            required
            className="w-full px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {t('contactEmail')} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              const newEmail = e.target.value;
              setFormData({ ...formData, email: newEmail });
              setUserInfo({ email: newEmail });
            }}
            placeholder={t('emailPlaceholder')}
            required
            className="w-full px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {t('emailVerification')} <span className="text-red-500">*</span>
          </label>
          {emailVerified ? (
            <div className="flex items-center justify-between rounded-xl border border-border bg-card/50 px-5 py-3">
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
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  placeholder={t('verificationCodePlaceholder')}
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
                  ? t('resendAfter', { seconds: cooldown })
                  : sendingCode
                    ? t('sending')
                    : t('sendCode')}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {t('siteLogo')}
          </label>
          <input
            type="url"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            placeholder={t('logoPlaceholder')}
            className="w-full px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {t('siteDescription')} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('descriptionPlaceholder')}
            rows={3}
            required
            className="w-full px-4 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none shadow-sm focus:shadow-md"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-border mt-5">
        <button
          type="submit"
          disabled={loading || success}
          className="w-full px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 transition-all font-medium relative overflow-hidden group"
        >
          {loading ? t('submitting') : success ? t('submitted') : t('submitApplication')}
        </button>
      </div>
    </form>
  );
}
