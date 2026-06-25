'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { articleApi } from '@/lib/api/article';
import type { PostVO } from '@/types';

interface PasswordGateProps {
  articleId: number;
  onUnlock: (article: PostVO) => void;
}

/**
 * 加密文章解锁 token 的 localStorage key 前缀。
 * 仅存储后端签发的随机 token（带 TTL），不再保存明文密码，避免 XSS 泄露密码。
 */
const TOKEN_KEY_PREFIX = 'article_unlock_';

function getStoredToken(articleId: number): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`${TOKEN_KEY_PREFIX}${articleId}`);
  } catch {
    return null;
  }
}

function storeToken(articleId: number, token: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${TOKEN_KEY_PREFIX}${articleId}`, token);
  } catch { /* ignore */ }
}

/** 供 SSR 首屏判断是否已有解锁凭证（避免闪烁密码框）。 */
export function isArticleUnlocked(articleId: number): boolean {
  return getStoredToken(articleId) !== null;
}

export default function PasswordGate({ articleId, onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 凭已有 token 复用解锁；token 失效则清掉，回退到密码输入
  const tryUnlockWithToken = useCallback(
    async (token: string) => {
      setLoading(true);
      setError('');
      try {
        const article = await articleApi.getUnlockedContent(articleId, token);
        onUnlock(article);
      } catch {
        // token 过期/无效，清除后让用户重新输入密码
        try { localStorage.removeItem(`${TOKEN_KEY_PREFIX}${articleId}`); } catch { /* ignore */ }
      } finally {
        setLoading(false);
      }
    },
    [articleId, onUnlock]
  );

  const verifyPassword = useCallback(
    async (pwd: string) => {
      setLoading(true);
      setError('');
      try {
        const { token, article } = await articleApi.verifyPassword(articleId, pwd);
        storeToken(articleId, token);
        onUnlock(article);
      } catch (e: unknown) {
        const msg = (e as { message?: string })?.message;
        setError(msg || '密码错误');
      } finally {
        setLoading(false);
      }
    },
    [articleId, onUnlock]
  );

  useEffect(() => {
    const token = getStoredToken(articleId);
    if (token) {
      tryUnlockWithToken(token);
    }
  }, [articleId, tryUnlockWithToken]);

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
