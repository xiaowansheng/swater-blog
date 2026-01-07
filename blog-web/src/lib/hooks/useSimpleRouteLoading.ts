'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function useSimpleRouteLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // 如果路径发生变化且不是首次加载
    if (prevPathnameRef.current && prevPathnameRef.current !== pathname) {
      console.log('路径变化检测:', prevPathnameRef.current, '->', pathname);
      
      // 立即显示加载状态
      setIsLoading(true);
      
      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 设置最小显示时间
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 1000); // 1秒确保能看到
    }

    // 更新上一次的路径
    prevPathnameRef.current = pathname;

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]);

  // 手动触发加载状态的函数
  const startLoading = () => {
    setIsLoading(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return { isLoading, startLoading };
}