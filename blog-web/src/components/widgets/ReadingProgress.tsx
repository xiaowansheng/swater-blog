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
        // 如果文章元素还没加载，隐藏进度条
        setProgress(0);
        setIsVisible(false);
        return;
      }

      const windowHeight = window.innerHeight;
      const documentScrollTop = window.scrollY;

      // 获取文章元素的位置信息
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const articleBottom = articleTop + articleHeight;

      // 文章可滚动的高度 = 文章高度 - 视口高度
      // 这确保了当文章底部到达视口底部时，进度为100%
      const scrollableArticleHeight = articleHeight - windowHeight;

      // 如果文章高度小于视口高度，不需要滚动，直接100%
      if (scrollableArticleHeight <= 0) {
        setProgress(100);
        setIsVisible(true);
        return;
      }

      // 当前滚动位置相对于文章顶部的偏移
      // 当文章顶部到达视口顶部时，offsetInArticle 为 0
      const offsetInArticle = documentScrollTop - articleTop;

      // 计算进度百分比
      let progress = 0;
      let inArticleRange = false;

      // 如果还没滚动到文章，不显示进度条
      if (documentScrollTop < articleTop) {
        progress = 0;
        inArticleRange = false;
      }
      // 如果已经滚动过文章底部，不显示进度条
      else if (documentScrollTop > articleBottom - windowHeight) {
        progress = 100;
        inArticleRange = false;
      }
      // 在文章内容内滚动，显示进度条
      else {
        progress = (offsetInArticle / scrollableArticleHeight) * 100;
        inArticleRange = true;
      }

      setProgress(Math.min(100, Math.max(0, progress)));
      setIsVisible(inArticleRange);
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress();

    return () => {
      window.removeEventListener('scroll', updateProgress);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-background/50 z-50">
      <div
        className="h-full bg-gradient-to-r from-deco-pink via-primary to-deco-blue transition-all duration-150 ease-out"
        style={{
          width: isVisible ? `${progress}%` : '0%',
          opacity: isVisible ? 1 : 0
        }}
      />
    </div>
  );
}

