'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const articleRef = useRef<HTMLElement | null>(null);
  const dimensionsRef = useRef({ top: 0, height: 0 });

  useEffect(() => {
    // 查找文章内容元素
    const findArticleElement = () => {
      const target =
        document.querySelector('[data-reading-target]') ||
        document.querySelector('article');

      if (target) {
        articleRef.current = target as HTMLElement;
        updateDimensions();
      }
    };

    const updateDimensions = () => {
      const article = articleRef.current;
      if (!article) {
        dimensionsRef.current = { top: 0, height: 0 };
        return;
      }
      const rect = article.getBoundingClientRect();
      const scrollTop = window.scrollY;
      dimensionsRef.current = {
        top: rect.top + scrollTop,
        height: article.offsetHeight
      };
    };

    // 初始查找并使用 MutationObserver 监听 DOM 变化
    findArticleElement();
    const observer = new MutationObserver(() => {
      findArticleElement();
      updateDimensions();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const updateProgress = () => {
      const { top: articleTop, height: articleHeight } = dimensionsRef.current;
      if (articleHeight === 0) {
        setProgress(0);
        setIsVisible(false);
        return;
      }

      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      const articleBottom = articleTop + articleHeight;

      const start = articleTop;
      const end = articleBottom - windowHeight;
      const scrollable = end - start;

      // 正文高度小于视口时，阅读条不展示
      if (scrollable <= 0) {
        setProgress(100);
        setIsVisible(false);
        return;
      }

      if (scrollTop < start) {
        setProgress(0);
        setIsVisible(false);
        return;
      }

      if (scrollTop >= end) {
        setProgress(100);
        setIsVisible(false);
        return;
      }

      const nextProgress = ((scrollTop - start) / scrollable) * 100;
      setProgress(Math.max(1, Math.min(100, nextProgress)));
      setIsVisible(true);
    };

    // 监听 resize 事件以更新尺寸缓存
    const handleResize = () => {
      updateDimensions();
      updateProgress();
    };

    // 使用 requestAnimationFrame 防抖节流滚动计算
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('load', handleResize, { passive: true });

    // 初始校准并计算进度
    updateDimensions();
    updateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('load', handleResize);
      observer.disconnect();
    };
  }, []);

  // 仅在正文阅读区间展示（到末尾满进度后隐藏）
  if (!isVisible || progress >= 100) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-background/50 z-50">
      <div
        className="h-full bg-gradient-to-r from-deco-pink via-primary to-deco-blue transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`
        }}
      />
    </div>
  );
}
