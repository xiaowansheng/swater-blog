'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Locale 内路由错误边界（Next.js App Router）
 * 继承 [locale]/layout.tsx 的布局（Header/Footer 等）。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error boundary:', error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center"
      role="alert"
    >
      <h1 className="text-2xl font-bold mb-4">页面出错了</h1>
      <p className="text-foreground/70 mb-2">
        {error.message || '渲染过程中发生异常'}
      </p>
      {error.digest && (
        <p className="text-xs text-foreground/50 mb-6">
          错误编号: {error.digest}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          重试
        </button>
        <Link
          href="/"
          className="px-4 py-2 border border-border rounded hover:bg-accent transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
