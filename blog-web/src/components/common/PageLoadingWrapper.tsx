'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import PageLoading from './PageLoading';

export default function PageLoadingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // 标记组件已挂载
    setMounted(true);

    // 检查是否是首次访问
    const hasVisited = sessionStorage.getItem('hasVisited');

    if (hasVisited) {
      // 已经访问过，不显示加载动画
      setIsLoading(false);
    } else {
      // 首次访问，显示加载动画
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem('hasVisited', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  // 路由切换时的加载（可选，如果需要每次路由切换都显示动画）
  useEffect(() => {
    // 可以在这里添加路由切换时的加载逻辑
    // 目前只保留首次访问的加载动画
  }, [pathname]);

  // 在挂载前直接渲染 children，避免闪烁
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      <PageLoading onComplete={() => setIsLoading(false)} />
      {!isLoading && children}
    </>
  );
}
