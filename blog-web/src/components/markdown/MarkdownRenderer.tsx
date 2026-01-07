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
      // 清空容器
      containerRef.current.innerHTML = '';
      
      // 使用 Vditor.preview 渲染 Markdown
      Vditor.preview(containerRef.current, content, {
        mode: 'light',
        anchor: 1,
        hljs: {
          enable: true,
          style: 'github'
        },
        math: {
          inlineDigit: true,
          engine: 'KaTeX'
        },
        speech: {
          enable: false
        },
        after: () => {
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
            setTimeout(onRendered, 50);
          }
        }
      });
    }
  }, [content, onRendered]);

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

