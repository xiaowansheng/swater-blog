'use client';

import { useState, useEffect } from 'react';

export function usePageLoading() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // 检查是否是首次加载
    const hasLoadedBefore = sessionStorage.getItem('pageLoaded');

    if (!hasLoadedBefore) {
      // 首次加载，显示加载动画
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsInitialLoad(false);
        sessionStorage.setItem('pageLoaded', 'true');
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      // 非首次加载，直接隐藏
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, []);

  return { isLoading, isInitialLoad };
}
