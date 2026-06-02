'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

interface ImagePreviewProps {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
  /** 可选的图片说明，与 images 一一对应（alt 文本） */
  alts?: string[];
}

/**
 * 文章图片预览组件
 *
 * 基于 yet-another-react-lightbox 封装，保持原有 props 接口不变。
 * 内置：双指/滚轮缩放、双击放大、键盘 ←/→/Esc、缩略图条、图片说明。
 */
export default function ImagePreview({
  images,
  open,
  onOpenChange,
  initialIndex = 0,
  alts,
}: ImagePreviewProps) {
  const indexRef = useRef(initialIndex);

  useEffect(() => {
    if (open) indexRef.current = initialIndex;
  }, [open, initialIndex]);

  // 将字符串数组转换为 lightbox slides
  const slides = useMemo(() => {
    return images.map((src, i) => ({
      src,
      alt: alts?.[i] || `图片 ${i + 1}`,
      title: alts?.[i] || '',
    }));
  }, [images, alts]);

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  // 关闭时滚动解锁由库内部处理；这里只需同步状态
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || images.length === 0) return null;

  return (
    <Lightbox
      open={open}
      close={handleClose}
      slides={slides}
      index={Math.min(initialIndex, slides.length - 1)}
      plugins={[Zoom, Captions, Thumbnails]}
      carousel={{ finite: slides.length <= 1 }}
      animation={{ fade: 220, swipe: 240, navigation: 240, zoom: 300 }}
      render={{
        // 隐藏顶部右上角"图片 n/总数"标签（用 captions 即可），避免视觉冗余
        iconPrev: () => (
          <span aria-hidden className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </span>
        ),
        iconNext: () => (
          <span aria-hidden className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
        ),
        iconClose: () => (
          <span aria-hidden className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </span>
        ),
      }}
      zoom={{
        maxZoomPixelRatio: 4,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
        doubleClickMaxStops: 2,
        keyboardMoveDistance: 60,
        wheelZoomDistanceFactor: 120,
        scrollToZoom: true,
      }}
      captions={{
        showToggle: false,
        descriptionMaxLines: 2,
        descriptionTextAlign: 'center',
      }}
      thumbnails={{
        position: 'bottom',
        width: 64,
        height: 48,
        border: 2,
        borderRadius: 6,
        padding: 4,
        gap: 6,
        imageFit: 'cover',
        showToggle: false,
      }}
      styles={{
        container: { backgroundColor: 'rgba(0, 0, 0, 0.88)' },
      }}
      on={{
        click: ({ index }) => {
          indexRef.current = index;
        },
        view: ({ index }) => {
          indexRef.current = index;
        },
      }}
    />
  );
}
