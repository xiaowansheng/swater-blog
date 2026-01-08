'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { guestbookApi } from '@/lib/api/guestbook';
import type { GuestbookVO } from '@/types';

interface GuestbookFormProps {
  onSuccess?: (message: GuestbookVO) => void;
}

export default function GuestbookForm({ onSuccess }: GuestbookFormProps) {
  const t = useTranslations('comment');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [qq, setQq] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter content');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const message = await guestbookApi.submit({
        nickname: nickname.trim() || undefined,
        email: email.trim() || undefined,
        qq: qq.trim() || undefined,
        content: content.trim(),
      });
      setNickname('');
      setEmail('');
      setQq('');
      setContent('');
      setSuccess(t('success'));
      onSuccess?.(message);
    } catch (err) {
      setError(t('error'));
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
      {success && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-800 rounded-xl shadow-sm">
          <p className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </p>
        </div>
      )}
      <div>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t('namePlaceholder')}
          className="w-full px-5 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
        />
      </div>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          className="w-full px-5 py-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm focus:shadow-md"
        />
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
