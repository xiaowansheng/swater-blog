'use client';

import { useEffect, useRef, useState } from 'react';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import ImagePreview from '@/components/ImagePreview';
import { useTheme } from '@/lib/utils/theme';

interface MarkdownRendererProps {
  content: string;
  onRendered?: () => void;
  enableImagePreview?: boolean;
}

export default function MarkdownRenderer({
  content,
  onRendered,
  enableImagePreview = false
}: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onRenderedTimerRef = useRef<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const { theme } = useTheme();
  const currentTheme: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';

  const openPreviewFromImage = (image: HTMLImageElement) => {
    if (!enableImagePreview || !containerRef.current) {
      return;
    }

    const images = Array.from(
      containerRef.current.querySelectorAll('img[data-markdown-preview="true"]')
    );
    const sources = images
      .map((item) => item.getAttribute('src') || item.currentSrc)
      .filter((src): src is string => Boolean(src));

    if (sources.length === 0) {
      return;
    }

    const currentIndex = images.indexOf(image);

    setPreviewImages(sources);
    setPreviewIndex(currentIndex >= 0 ? currentIndex : 0);
    setPreviewOpen(true);
  };

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!enableImagePreview) {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const image = target.closest('img[data-markdown-preview="true"]');
    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    event.preventDefault();
    openPreviewFromImage(image);
  };

  const handleContainerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableImagePreview || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    if (!(event.target instanceof HTMLImageElement)) {
      return;
    }

    if (event.target.dataset.markdownPreview !== 'true') {
      return;
    }

    event.preventDefault();
    openPreviewFromImage(event.target);
  };

  useEffect(() => {
    let disposed = false;
    const container = containerRef.current;

    if (container && content) {
      // 清空容器
      container.innerHTML = '';

      // 使用 Vditor.preview 渲染 Markdown
      Vditor.preview(container, content, {
        // 跟随站点主题
        mode: currentTheme,
        theme: currentTheme,
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

          if (enableImagePreview) {
            const images = Array.from(container.querySelectorAll('img'));
            images.forEach((image, index) => {
              if (!(image instanceof HTMLImageElement) || !(image.getAttribute('src') || image.currentSrc)) {
                return;
              }

              if (image.closest('a')) {
                image.dataset.markdownPreview = 'false';
                image.classList.remove('markdown-preview-image');
                image.removeAttribute('tabindex');
                image.removeAttribute('role');
                image.removeAttribute('title');
                image.removeAttribute('aria-label');
                return;
              }

              image.dataset.markdownPreview = 'true';
              image.classList.add('markdown-preview-image');
              image.tabIndex = 0;
              image.setAttribute('role', 'button');
              image.setAttribute('title', '点击预览');
              image.setAttribute(
                'aria-label',
                image.alt ? `预览图片：${image.alt}` : `预览第 ${index + 1} 张图片`
              );
            });
          }

          // 渲染完成后的回调
          if (container) {
            // 触发自定义事件通知其他组件
            const event = new CustomEvent('vditorRendered', {
              detail: { container }
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
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [content, onRendered, currentTheme, enableImagePreview]);

  return (
    <>
      <div
        ref={containerRef}
        className="vditor-reset prose prose-lg max-w-none"
        style={{
          maxWidth: '100%',
          width: '100%'
        }}
        onClick={handleContainerClick}
        onKeyDown={handleContainerKeyDown}
      />
      {previewOpen && (
        <ImagePreview
          images={previewImages}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          initialIndex={previewIndex}
        />
      )}
    </>
  );
}
