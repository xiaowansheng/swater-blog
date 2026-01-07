'use client';

import { useEffect, useRef } from 'react';
import Vditor from 'vditor';
import 'vditor/dist/index.css';

interface MarkdownRendererProps {
  content: string;
  onRendered?: () => void;
}

export default function MarkdownRenderer({ content, onRendered }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && content) {
      // 清空之前的内容
      containerRef.current.innerHTML = '';
      
      // 简化的 Vditor 预览配置
      Vditor.preview(containerRef.current, content, {
        mode: 'light',
        hljs: {
          enable: true,
          style: 'github',
          lineNumber: false
        },
        math: {
          inlineDigit: true,
          engine: 'KaTeX'
        },
        speech: {
          enable: false,
        },
        anchor: 1,
        after: () => {
          if (containerRef.current) {
            containerRef.current.classList.add('vditor-content');
            containerRef.current.style.visibility = 'visible';
            
            // 触发自定义事件通知 TOC 组件
            const event = new CustomEvent('vditorRendered', {
              detail: { container: containerRef.current }
            });
            window.dispatchEvent(event);
          }
          if (onRendered) {
            setTimeout(onRendered, 100);
          }
        }
      });
    }
  }, [content, onRendered]);

  return (
    <div 
      ref={containerRef}
      className="vditor-reset max-w-none prose prose-lg dark:prose-invert"
      style={{ 
        minHeight: '200px',
        visibility: 'hidden',
        maxWidth: '100%',
        width: '100%',
        overflow: 'hidden'
      }}
    />
  );
}

