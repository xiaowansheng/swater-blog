'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LOADING_CONFIG } from '@/lib/constants/loading';
import { resetPageReady, getPageReadyState } from './usePageReady';

export type LoadingScope = 'page' | 'query';

interface LoadingSnapshot {
  isLoading: boolean;
  scope: LoadingScope;
}

type LoadingListener = (snapshot: LoadingSnapshot) => void;

// 全局状态
let globalLoadingState: LoadingSnapshot = { isLoading: false, scope: 'page' };
let visibleStartAt: number | null = null;
let currentToken = 0;
let stopTimerId: NodeJS.Timeout | undefined;
let showTimerId: NodeJS.Timeout | undefined;
let clickListenerAttached = false;

const listeners = new Set<LoadingListener>();

const notify = () => {
  listeners.forEach((listener) => listener(globalLoadingState));
};

const clearAllTimers = () => {
  if (showTimerId) {
    clearTimeout(showTimerId);
    showTimerId = undefined;
  }
  if (stopTimerId) {
    clearTimeout(stopTimerId);
    stopTimerId = undefined;
  }
};

/**
 * 启动加载状态
 * @param scope 加载作用域：page（整页切换）| query（同页参数变化）
 * @param showThreshold 显示阈值，低于阈值不展示 loading
 * @returns 当前加载的 token，用于并发控制
 */
const startGlobalLoading = (
  scope: LoadingScope,
  showThreshold: number = scope === 'query' ? LOADING_CONFIG.SHOW_THRESHOLD : 0
): number => {
  // 生成新的 token
  currentToken++;
  const token = currentToken;

  clearAllTimers();

  const showLoading = () => {
    if (token !== currentToken) return;
    visibleStartAt = Date.now();
    globalLoadingState = { isLoading: true, scope };
    notify();
  };

  // query 级加载始终异步显示（即使阈值为 0），避免同一点击事件被误拦截
  if (scope === 'query' || showThreshold > 0) {
    showTimerId = setTimeout(() => {
      showLoading();
      showTimerId = undefined;
    }, showThreshold);
  } else {
    showLoading();
  }

  return token;
};

/**
 * 停止加载状态（带最小时长保护）
 * @param token 启动时返回的 token，用于并发控制
 * @param minDuration 最小持续时间（毫秒）
 */
const stopGlobalLoading = (
  token: number,
  minDuration: number = LOADING_CONFIG.ROUTE_MIN_DURATION
) => {
  // 并发安全：只处理当前 token 的请求
  if (token !== currentToken) {
    return;
  }

  // 如果还在显示阈值等待中，直接取消，不展示 loading
  if (showTimerId) {
    clearTimeout(showTimerId);
    showTimerId = undefined;
    visibleStartAt = null;
    return;
  }

  // 当前没有显示中的 loading，直接返回
  if (!globalLoadingState.isLoading) {
    visibleStartAt = null;
    return;
  }

  // 计算已经过的时间
  const elapsed = visibleStartAt ? Date.now() - visibleStartAt : 0;
  const remaining = Math.max(0, minDuration - elapsed);

  // 如果还没到最小时长，延迟关闭
  if (remaining > 0) {
    stopTimerId = setTimeout(() => {
      globalLoadingState = { isLoading: false, scope: globalLoadingState.scope };
      visibleStartAt = null;
      notify();
      stopTimerId = undefined;
    }, remaining);
  } else {
    // 已经超过最小时长，立即关闭
    globalLoadingState = { isLoading: false, scope: globalLoadingState.scope };
    visibleStartAt = null;
    notify();
  }
};

/**
 * 判断点击事件应该触发哪种加载
 */
const getLoadingScopeFromClick = (event: MouseEvent): LoadingScope | null => {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;

  const target = event.target as Element | null;
  const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
  if (!anchor) return null;

  if (anchor.target && anchor.target !== '_self') return null;
  if (anchor.hasAttribute('download')) return null;

  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) return null;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    // 只改变了 hash（锚点）的情况
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash
    ) {
      return null;
    }
    // 点击的是当前页面（pathname 和 search 都相同）的情况
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return null;
    }

    if (url.pathname !== window.location.pathname) {
      return 'page';
    }

    if (url.search !== window.location.search) {
      return 'query';
    }
  } catch {
    return null;
  }

  return null;
};

/**
 * 确保全局点击监听器已注册
 */
const ensureClickListener = () => {
  if (clickListenerAttached || typeof window === 'undefined') return;
  
  document.addEventListener(
    'click',
    (event) => {
      const scope = getLoadingScopeFromClick(event);
      if (scope) {
        startGlobalLoading(scope);
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
  const [loadingState, setLoadingState] = useState<LoadingSnapshot>(globalLoadingState);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef<string | undefined>(undefined);
  const prevSearchRef = useRef<string | undefined>(undefined);
  const tokenRef = useRef<number>(0);
  const search = searchParams.toString();

  // 订阅全局加载状态
  useEffect(() => {
    const listener: LoadingListener = (snapshot) => {
      setLoadingState(snapshot);
    };

    listeners.add(listener);
    ensureClickListener();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  // 监听路由变化（作为程序化导航的兜底）
  useEffect(() => {
    const prevPath = prevPathRef.current;
    const prevSearch = prevSearchRef.current;
    const routeChanged = !!prevPath && (prevPath !== pathname || prevSearch !== search);

    if (routeChanged) {
      const scope: LoadingScope = prevPath !== pathname ? 'page' : 'query';

      // 如果点击监听已先触发，复用现有 loading；否则兜底启动
      if (!globalLoadingState.isLoading) {
        tokenRef.current = startGlobalLoading(scope);
      } else {
        tokenRef.current = currentToken;
      }

      // 重置页面就绪状态
      resetPageReady();

      // 路由变化完成（pathname/search 更新说明导航已完成）
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

    prevPathRef.current = pathname;
    prevSearchRef.current = search;
  }, [pathname, search]);

  /**
   * 手动启动加载（用于程序化导航）
   * @param options.scope 加载作用域
   * @param options.minDuration 最小持续时间
   * @param options.showThreshold 显示阈值
   */
  const startLoading = ({
    scope = 'page',
    minDuration = LOADING_CONFIG.ROUTE_MIN_DURATION as number,
    showThreshold,
  }: {
    scope?: LoadingScope;
    minDuration?: number;
    showThreshold?: number;
  } = {}) => {
    const token = startGlobalLoading(scope, showThreshold);
    tokenRef.current = token;

    // 返回一个停止函数，让调用者可以手动控制
    return () => stopGlobalLoading(token, minDuration);
  };

  return {
    isLoading: loadingState.isLoading,
    loadingScope: loadingState.scope,
    isRouteLoading: loadingState.isLoading && loadingState.scope === 'page',
    isQueryLoading: loadingState.isLoading && loadingState.scope === 'query',
    startLoading,
  };
}
