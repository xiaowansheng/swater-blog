'use client';

import { useEffect, useState, useRef } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // 查找文章内容元素
    const findArticleElement = () => {
      const target =
        document.querySelector('[data-reading-target]') ||
        document.querySelector('article');

      if (target) {
        articleRef.current = target as HTMLElement;
      }
    };

    // 初始查找并使用 MutationObserver 监听 DOM 变化
    findArticleElement();
    const observer = new MutationObserver(findArticleElement);
    observer.observe(document.body, { childList: true, subtree: true });

    const updateProgress = () => {
      const article = articleRef.current;
      if (!article) {
        setProgress(0);
        setIsVisible(false);
        return;
      }

      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + scrollTop;
      const articleBottom = articleTop + article.offsetHeight;

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

    window.addEventListener('scroll', updateProgress);
    updateProgress();

    return () => {
      window.removeEventListener('scroll', updateProgress);
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

