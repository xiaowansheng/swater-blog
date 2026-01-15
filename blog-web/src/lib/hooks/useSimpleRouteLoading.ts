'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LOADING_CONFIG } from '@/lib/constants/loading';
import { resetPageReady, getPageReadyState } from './usePageReady';

type LoadingListener = (loading: boolean) => void;

// 全局状态
let globalLoading = false;
let startAt: number | null = null;
let currentToken = 0;
let timeoutId: NodeJS.Timeout | undefined;
let clickListenerAttached = false;

const listeners = new Set<LoadingListener>();

const notify = () => {
  listeners.forEach((listener) => listener(globalLoading));
};

/**
 * 启动加载状态
 * @returns 当前加载的 token，用于并发控制
 */
const startGlobalLoading = (): number => {
  // 生成新的 token
  currentToken++;
  const token = currentToken;

  // 清理旧的定时器
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  }

  // 记录开始时间
  startAt = Date.now();
  globalLoading = true;
  notify();

  return token;
};

/**
 * 停止加载状态（带最小时长保护）
 * @param token 启动时返回的 token，用于并发控制
 * @param minDuration 最小持续时间（毫秒）
 */
const stopGlobalLoading = (token: number, minDuration = LOADING_CONFIG.ROUTE_MIN_DURATION) => {
  // 并发安全：只处理当前 token 的请求
  if (token !== currentToken) {
    return;
  }

  // 清理旧的定时器
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  }

  // 计算已经过的时间
  const elapsed = startAt ? Date.now() - startAt : 0;
  const remaining = Math.max(0, minDuration - elapsed);

  // 如果还没到最小时长，延迟关闭
  if (remaining > 0) {
    timeoutId = setTimeout(() => {
      globalLoading = false;
      startAt = null;
      notify();
      timeoutId = undefined;
    }, remaining);
  } else {
    // 已经超过最小时长，立即关闭
    globalLoading = false;
    startAt = null;
    notify();
  }
};

/**
 * 判断点击事件是否应该触发加载
 */
const shouldStartLoadingFromClick = (event: MouseEvent): boolean => {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const target = event.target as Element | null;
  const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
  if (!anchor) return false;

  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;

  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) return false;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    // 只改变了 hash（锚点）的情况
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash
    ) {
      return false;
    }
    // 点击的是当前页面（pathname 和 search 都相同）的情况
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
};

/**
 * 确保全局点击监听器已注册
 */
const ensureClickListener = () => {
  if (clickListenerAttached || typeof window === 'undefined') return;
  
  document.addEventListener(
    'click',
    (event) => {
      if (shouldStartLoadingFromClick(event)) {
        startGlobalLoading();
      }
    },
    true
  );
  
  clickListenerAttached = true;
};

/**
 * 路由加载状态 Hook
 * 
 * 特性：
 * - 自动监听路由变化
 * - 并发安全（快速切换不会出错）
 * - 最小时长防闪烁
 * - 真实完成即关闭
 */
export function useSimpleRouteLoading() {
  const [isLoading, setIsLoading] = useState(globalLoading);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | undefined>(undefined);
  const tokenRef = useRef<number>(0);

  // 订阅全局加载状态
  useEffect(() => {
    const listener: LoadingListener = (loading) => {
      setIsLoading(loading);
    };

    listeners.add(listener);
    ensureClickListener();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  // 监听路由变化
  useEffect(() => {
    // 路由开始变化
    if (prevPathnameRef.current && prevPathnameRef.current !== pathname) {
      const token = startGlobalLoading();
      tokenRef.current = token;
      
      // 重置页面就绪状态
      resetPageReady();
    }
    
    // 路由变化完成（pathname 更新说明路由已完成）
    if (prevPathnameRef.current && prevPathnameRef.current !== pathname) {
      // 使用 requestAnimationFrame 确保 DOM 已更新
      requestAnimationFrame(() => {
        // 再给一帧时间让 React 完成渲染
        requestAnimationFrame(() => {
          // 检查页面是否已就绪
          // 如果页面有数据加载，会通过 markPageReady() 通知
          // 这里给一个短暂的等待时间，让页面有机会标记就绪
          const checkReady = () => {
            if (getPageReadyState()) {
              stopGlobalLoading(tokenRef.current);
            } else {
              // 如果页面没有使用 PageReady 机制，默认认为已就绪
              // 给 50ms 的缓冲时间
              setTimeout(() => {
                stopGlobalLoading(tokenRef.current);
              }, 50);
            }
          };
          
          checkReady();
        });
      });
    }
    
    prevPathnameRef.current = pathname;
  }, [pathname]);

  /**
   * 手动启动加载（用于程序化导航）
   * @param minDuration 最小持续时间
   */
  const startLoading = (minDuration = LOADING_CONFIG.ROUTE_MIN_DURATION) => {
    const token = startGlobalLoading();
    tokenRef.current = token;
    
    // 返回一个停止函数，让调用者可以手动控制
    return () => stopGlobalLoading(token, minDuration);
  };

  return { isLoading, startLoading };
}
