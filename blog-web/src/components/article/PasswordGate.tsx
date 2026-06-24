'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import type { PostVO } from '@/types';

interface PasswordGateProps {
  articleId: number;
  onUnlock: (article: PostVO) => void;
}

const STORAGE_KEY_PREFIX = 'article_pwd_';

function getStoredPassword(articleId: number): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}${articleId}`);
  } catch {
    return null;
  }
}

function storePassword(articleId: number, password: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${articleId}`, password);
  } catch { /* ignore */ }
}

export function isArticleUnlocked(articleId: number): boolean {
  return getStoredPassword(articleId) !== null;
}

export default function PasswordGate({ articleId, onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyPassword = useCallback(
    async (pwd: string) => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(
          `/api/public/post/${articleId}/verify-password?password=${encodeURIComponent(pwd)}`,
          { method: 'POST' }
        );
        const json = await res.json();

        if (json.code === 200 && json.data) {
          storePassword(articleId, pwd);
          onUnlock(json.data);
        } else {
          setError(json.message || '密码错误');
        }
      } catch {
        setError('验证失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    },
    [articleId, onUnlock]
  );

  useEffect(() => {
    const stored = getStoredPassword(articleId);
    if (stored) {
      verifyPassword(stored);
    }
  }, [articleId, verifyPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }
    verifyPassword(password);
  };

  return (
    <Card hoverEffect={false} className="w-full max-w-md mx-auto mt-20">
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">此文章已加密</h2>
        <p className="text-sm text-muted-foreground mb-6">请输入密码以查看内容</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="输入密码"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-center text-lg tracking-widest outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? '验证中...' : '确认'}
          </button>
        </form>
      </div>
    </Card>
  );
}
