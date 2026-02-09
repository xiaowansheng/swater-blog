'use client';

import { useEffect, useRef } from 'react';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import { useTheme } from '@/lib/utils/theme';

interface MarkdownRendererProps {
  content: string;
  onRendered?: () => void;
}

export default function MarkdownRenderer({ content, onRendered }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onRenderedTimerRef = useRef<number | null>(null);
  const { theme } = useTheme();
  const currentTheme = theme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    let disposed = false;
    if (containerRef.current && content) {
      // 清空容器
      containerRef.current.innerHTML = '';

      // 使用 Vditor.preview 渲染 Markdown
      Vditor.preview(containerRef.current, content, {
        // 跟随站点主题
        mode: currentTheme as any,
        theme: currentTheme as any,
        anchor: 1,
        markdown: {
          // 相对路径图片的基础 URL 前缀
          linkBase: process.env.NEXT_PUBLIC_UPLOAD_RESOURCE_PREFIX,
        },
        hljs: {
          enable: true,
          style: currentTheme === 'dark' ? 'atom-one-dark' : 'github'
        },
        math: {
          inlineDigit: true,
          engine: 'KaTeX'
        },
        speech: {
          enable: false
        },
        after: () => {
          if (disposed) return;
          // 渲染完成后的回调
          if (containerRef.current) {
            // 触发自定义事件通知其他组件
            const event = new CustomEvent('vditorRendered', {
              detail: { container: containerRef.current }
            });
            window.dispatchEvent(event);
          }

          // 执行回调
          if (onRendered) {
            onRenderedTimerRef.current = window.setTimeout(onRendered, 50);
          }
        }
      });
    }
    return () => {
      disposed = true;
      if (onRenderedTimerRef.current !== null) {
        window.clearTimeout(onRenderedTimerRef.current);
        onRenderedTimerRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [content, onRendered, currentTheme]);

  return (
    <div
      ref={containerRef}
      className="vditor-reset prose prose-lg max-w-none"
      style={{
        maxWidth: '100%',
        width: '100%'
      }}
    />
  );
}

