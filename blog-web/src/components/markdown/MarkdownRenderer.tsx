'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import 'vditor/dist/index.css';
import ExternalLinkDialog from '@/components/markdown/ExternalLinkDialog';
import { useTheme } from '@/lib/utils/theme';
import dynamic from 'next/dynamic';

const ImagePreview = dynamic(() => import('@/components/ImagePreview'), { ssr: false });

interface MarkdownRendererProps {
  content: string;
  onRendered?: () => void;
  enableImagePreview?: boolean;
  /** 自定义 className，会附加到最外层容器 */
  className?: string;
}

export default function MarkdownRenderer({
  content,
  onRendered,
  enableImagePreview = false,
  className,
}: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderingRef = useRef<HTMLDivElement>(null);
  const onRenderedTimerRef = useRef<number | null>(null);
  // 把回调放进 ref，避免父组件传 inline 函数时触发 Vditor 重渲
  const onRenderedRef = useRef(onRendered);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewAlts, setPreviewAlts] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [externalUrl, setExternalUrl] = useState<string>('');

  const { theme, mounted } = useTheme();
  const currentTheme: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    onRenderedRef.current = onRendered;
  }, [onRendered]);

  const openPreviewFromImage = useCallback(
    (image: HTMLImageElement) => {
      if (!enableImagePreview || !containerRef.current) return;

      const images = Array.from(
        containerRef.current.querySelectorAll<HTMLImageElement>('img[data-markdown-preview="true"]')
      );
      const sources = images
        .map((item) => item.getAttribute('src') || item.currentSrc)
        .filter((src): src is string => Boolean(src));

      if (sources.length === 0) return;

      const currentIndex = images.indexOf(image);
      const alts = images.map((item) => item.getAttribute('alt') || '');

      setPreviewImages(sources);
      setPreviewAlts(alts);
      setPreviewIndex(currentIndex >= 0 ? currentIndex : 0);
      setPreviewOpen(true);
    },
    [enableImagePreview]
  );

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    // 1. 外链拦截：优先于图片预览处理（外链里的图片走原生跳转）
    const anchor = target.closest('a.markdown-external-link');
    if (anchor instanceof HTMLAnchorElement) {
      const href = anchor.getAttribute('href') || '';
      if (href) {
        event.preventDefault();
        setExternalUrl(href);
        return;
      }
    }

    // 2. 图片预览
    if (!enableImagePreview) return;

    const image = target.closest('img[data-markdown-preview="true"]');
    if (!(image instanceof HTMLImageElement)) return;

    event.preventDefault();
    openPreviewFromImage(image);
  };

  const handleConfirmExternal = useCallback(() => {
    if (!externalUrl) return;
    window.open(externalUrl, '_blank', 'noopener,noreferrer');
    setExternalUrl('');
  }, [externalUrl]);

  const handleCancelExternal = useCallback(() => {
    setExternalUrl('');
  }, []);

  const handleContainerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableImagePreview || (event.key !== 'Enter' && event.key !== ' ')) return;
    if (!(event.target instanceof HTMLImageElement)) return;
    if (event.target.dataset.markdownPreview !== 'true') return;

    event.preventDefault();
    openPreviewFromImage(event.target);
  };

  // 给渲染后的 DOM 做增强：图片懒加载/预览标记、外链处理、代码块复制按钮
  const enhanceDom = useCallback(
    (root: HTMLElement) => {
      // 1. 图片：懒加载 + 预览态标记
      const images = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
      images.forEach((image, index) => {
        // 跳过图标表情等极小图（Vditor 表情包走 src，但懒加载仍然加）
        if (!image.hasAttribute('loading')) {
          image.setAttribute('loading', 'lazy');
          image.setAttribute('decoding', 'async');
        }

        const hasLink = Boolean(image.closest('a'));
        const hasSource = Boolean(image.getAttribute('src') || image.currentSrc);
        if (!hasSource) return;

        if (hasLink) {
          image.dataset.markdownPreview = 'false';
          image.classList.remove('markdown-preview-image');
          image.removeAttribute('tabindex');
          image.removeAttribute('role');
          image.removeAttribute('title');
          image.removeAttribute('aria-label');
          return;
        }

        if (enableImagePreview) {
          image.dataset.markdownPreview = 'true';
          image.classList.add('markdown-preview-image');
          image.tabIndex = 0;
          image.setAttribute('role', 'button');
          image.setAttribute('title', '点击预览');
          image.setAttribute(
            'aria-label',
            image.alt ? `预览图片：${image.alt}` : `预览第 ${index + 1} 张图片`
          );
        }
      });

      // 2. 外链：新标签页打开 + 安全 rel
      const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]'));
      links.forEach((link) => {
        const href = link.getAttribute('href') || '';
        // 仅处理 http(s) 和协议相对外链
        if (!/^https?:\/\//i.test(href)) return;

        // 排除已经是锚点/站内的链接（理论上 http(s) 一定是外链，这里再保险过滤）
        try {
          const url = new URL(href, window.location.href);
          if (url.host === window.location.host) return;
        } catch {
          return;
        }

        link.setAttribute('target', '_blank');
        const existingRel = link.getAttribute('rel') || '';
        const relSet = new Set(existingRel.split(/\s+/).filter(Boolean));
        relSet.add('noopener');
        relSet.add('noreferrer');
        if (!relSet.has('opener')) relSet.add('noopener');
        link.setAttribute('rel', Array.from(relSet).join(' '));
        // 视觉提示，外链稍微区分一下
        if (!link.querySelector(':scope > .markdown-external-icon')) {
          link.classList.add('markdown-external-link');
        }
      });
    },
    [enableImagePreview]
  );

  useEffect(() => {
    let disposed = false;
    const container = containerRef.current;
    const renderingIndicator = renderingRef.current;
    if (!container) return;

    if (!mounted) {
      container.innerHTML = '';
      if (renderingIndicator) renderingIndicator.hidden = true;
      return;
    }

    // 空内容直接清空，不进入 Vditor
    if (!content || !content.trim()) {
      container.innerHTML = '';
      if (renderingIndicator) renderingIndicator.hidden = true;
      return;
    }

    container.innerHTML = '';
    if (renderingIndicator) renderingIndicator.hidden = false;

    const renderVditor = async () => {
      try {
        const Vditor = (await import('vditor')).default;
        if (disposed) return;

        Vditor.preview(container, content, {
          mode: currentTheme,
          theme: { current: currentTheme },
          anchor: 1,
          markdown: {
            linkBase: process.env.NEXT_PUBLIC_UPLOAD_RESOURCE_PREFIX,
          },
          hljs: {
            enable: true,
            style: currentTheme === 'dark' ? 'atom-one-dark' : 'github',
          },
          math: {
            inlineDigit: true,
            engine: 'KaTeX',
          },
          speech: { enable: false },
          after: () => {
            if (disposed) return;

            enhanceDom(container);

            if (container) {
              const event = new CustomEvent('vditorRendered', { detail: { container } });
              window.dispatchEvent(event);
            }

            // 渲染完成，先关掉 loading 再触发回调
            if (renderingIndicator) renderingIndicator.hidden = true;

            if (onRenderedRef.current) {
              onRenderedTimerRef.current = window.setTimeout(() => {
                onRenderedRef.current?.();
              }, 50);
            }
          },
        });
      } catch (error) {
        console.error('Failed to load Vditor:', error);
      }
    };

    renderVditor();

    return () => {
      disposed = true;
      if (onRenderedTimerRef.current !== null) {
        window.clearTimeout(onRenderedTimerRef.current);
        onRenderedTimerRef.current = null;
      }
      if (container) container.innerHTML = '';
      if (renderingIndicator) renderingIndicator.hidden = true;
    };
  }, [content, currentTheme, enhanceDom, mounted]);

  return (
    <>
      <div
        ref={containerRef}
        className={['vditor-reset', 'markdown-renderer', className].filter(Boolean).join(' ')}
        style={{ maxWidth: '100%', width: '100%' }}
        onClick={handleContainerClick}
        onKeyDown={handleContainerKeyDown}
      />
      <div ref={renderingRef} className="markdown-rendering" aria-hidden="true" hidden>
        <div className="markdown-rendering__line w-3/4" />
        <div className="markdown-rendering__line w-full" />
        <div className="markdown-rendering__line w-5/6" />
        <div className="markdown-rendering__line w-2/3" />
        <div className="markdown-rendering__line w-full" />
      </div>
      {previewOpen && (
        <ImagePreview
          images={previewImages}
          alts={previewAlts}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          initialIndex={previewIndex}
        />
      )}
      <ExternalLinkDialog
        open={Boolean(externalUrl)}
        url={externalUrl}
        onConfirm={handleConfirmExternal}
        onCancel={handleCancelExternal}
      />
    </>
  );
}
