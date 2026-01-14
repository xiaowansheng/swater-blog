'use client';

import { useEffect, useRef } from 'react';

/**
 * PageReady 机制
 * 
 * 用于通知页面关键数据已加载完成
 * 可以配合 loading 状态使用，确保不会过早关闭加载动画
 * 
 * 使用场景：
 * - CSR 数据请求完成
 * - 骨架屏消失
 * - 关键图片加载完成
 */

type PageReadyListener = () => void;

let isPageReady = false;
const listeners = new Set<PageReadyListener>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

/**
 * 标记页面已准备就绪
 */
export const markPageReady = () => {
  if (isPageReady) return;
  isPageReady = true;
  notify();
};

/**
 * 重置页面就绪状态（路由切换时调用）
 */
export const resetPageReady = () => {
  isPageReady = false;
};

/**
 * 获取当前页面就绪状态
 */
export const getPageReadyState = () => isPageReady;

/**
 * 页面就绪 Hook
 * 
 * @param onReady 页面就绪时的回调
 * @param deps 依赖项（可选）
 * 
 * @example
 * ```tsx
 * // 在页面组件中使用
 * usePageReady(() => {
 *   console.log('页面数据已加载完成');
 * });
 * 
 * // 在数据请求完成后标记
 * useEffect(() => {
 *   fetchData().then(() => {
 *     markPageReady();
 *   });
 * }, []);
 * ```
 */
export function usePageReady(onReady?: () => void, deps: React.DependencyList = []) {
  const onReadyRef = useRef(onReady);
  
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    // 如果已经就绪，立即调用
    if (isPageReady && onReadyRef.current) {
      onReadyRef.current();
    }

    // 订阅就绪事件
    const listener: PageReadyListener = () => {
      onReadyRef.current?.();
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    isReady: isPageReady,
    markReady: markPageReady,
    reset: resetPageReady,
  };
}

/**
 * 自动标记页面就绪的 Hook
 * 
 * 在组件挂载后自动标记页面就绪
 * 适用于不需要额外数据加载的静态页面
 * 
 * @param delay 延迟时间（毫秒），默认 0
 * 
 * @example
 * ```tsx
 * function StaticPage() {
 *   useAutoPageReady(); // 组件挂载后立即标记就绪
 *   return <div>静态内容</div>;
 * }
 * ```
 */
export function useAutoPageReady(delay = 0) {
  useEffect(() => {
    const timer = setTimeout(() => {
      markPageReady();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);
}
