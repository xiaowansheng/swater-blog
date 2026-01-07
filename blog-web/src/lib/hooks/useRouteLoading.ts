'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useRouteLoadingContext } from '@/lib/context/RouteLoadingContext';

export function useRouteLoading() {
  const { isLoading, startLoading, stopLoading } = useRouteLoadingContext();
  const pathname = usePathname();
  const prevPathnameRef = useRef<string>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 如果路径发生变化且不是首次加载
    if (prevPathnameRef.current && prevPathnameRef.current !== pathname) {
      console.log('路径变化:', prevPathnameRef.current, '->', pathname);
      
      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 如果还没有加载状态，启动加载
      if (!isLoading) {
        startLoading();
      }

      // 设置最小显示时间，确保用户能看到加载动画
      timeoutRef.current = setTimeout(() => {
        stopLoading();
      }, 800); // 增加到 800ms 确保能看到
    }

    // 更新上一次的路径
    prevPathnameRef.current = pathname;

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, isLoading, startLoading, stopLoading]);

  return isLoading;
}