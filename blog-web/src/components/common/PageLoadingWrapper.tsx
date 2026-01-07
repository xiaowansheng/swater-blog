'use client';

import { useEffect, useState } from 'react';
import PageLoading from './PageLoading';
import RouteLoading from './RouteLoading';

export default function PageLoadingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 首次访问的加载逻辑
  useEffect(() => {
    // 标记组件已挂载
    setMounted(true);

    // 检查是否是首次访问
    const hasVisited = sessionStorage.getItem('hasVisited');

    if (hasVisited) {
      // 已经访问过，不显示首次加载动画
      setIsInitialLoading(false);
    } else {
      // 首次访问，显示加载动画
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
        sessionStorage.setItem('hasVisited', 'true');
      }, 3000); // 增加到3秒，让用户能完整体验首屏动画

      return () => clearTimeout(timer);
    }
  }, []);

  // 在挂载前或首次加载时，只显示加载动画
  if (!mounted || isInitialLoading) {
    return (
      <>
        {mounted && (
          <PageLoading onComplete={() => setIsInitialLoading(false)} minDuration={3000} />
        )}
      </>
    );
  }

  return (
    <>
      {/* 路由切换加载动画 */}
      <RouteLoading />
      
      {/* 页面内容 */}
      {children}
    </>
  );
}
