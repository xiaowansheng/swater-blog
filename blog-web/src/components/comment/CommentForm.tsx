'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { commentApi } from '@/lib/api/comment';

interface CommentFormProps {
  postId?: number;
  momentId?: number;
  parentId?: number;
  onSuccess?: () => void;
}

export default function CommentForm({
  postId,
  momentId,
  parentId,
  onSuccess,
}: CommentFormProps) {
  const t = useTranslations('comment');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) {
      setError('Please fill in required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await commentApi.submit({
        postId,
        momentId,
        parentId,
        nickname: nickname.trim(),
        email: email.trim() || undefined,
        content: content.trim(),
      });
      setNickname('');
      setEmail('');
      setContent('');
      onSuccess?.();
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t('namePlaceholder')}
          required
          className="w-full px-4 py-2 border rounded-lg bg-background"
        />
      </div>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          className="w-full px-4 py-2 border rounded-lg bg-background"
        />
      </div>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('placeholder')}
          required
          rows={4}
          className="w-full px-4 py-2 border rounded-lg bg-background"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? t('loading') || 'Loading...' : t('submit')}
        </button>
        {parentId && (
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 border rounded-lg hover:bg-foreground/10"
          >
            {t('cancel')}
          </button>
        )}
      </div>
    </form>
  );
}

