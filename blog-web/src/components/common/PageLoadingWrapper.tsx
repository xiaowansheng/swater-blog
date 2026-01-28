'use client';

import { useEffect, useState } from 'react';
import PageLoading from './PageLoading';
import RouteLoading from './RouteLoading';
import { LOADING_CONFIG } from '@/lib/constants/loading';

/**
 * 页面加载包装器
 *
 * 职责：
 * 1. 首次访问：显示品牌开场动画（保留完整体验）
 * 2. 后续访问：直接显示内容 + 路由切换动画
 *
 * 优化点：
 * - 首屏开场动画保留，但会监听真实加载完成
 * - 如果真实加载很快，开场动画也会相应缩短
 * - 使用 sessionStorage 区分首次/后续访问
 * - **重要优化**：动画期间就开始渲染页面内容，避免动画完成才开始渲染
 */
export default function PageLoadingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  // 首次访问的加载逻辑
  useEffect(() => {
    // 标记组件已挂载
    setMounted(true);

    // 检查是否是首次访问
    const hasVisited = sessionStorage.getItem('hasVisited');

    if (hasVisited) {
      // 已经访问过，不显示首次加载动画
      setIsInitialLoading(false);
      setPageReady(true);
    } else {
      // 首次访问，监听页面真实加载完成
      const startTime = Date.now();

      // 方案：监听多个信号，取最快的
      let completed = false;

      const completeLoading = () => {
        if (completed) return;
        completed = true;

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(
          0,
          LOADING_CONFIG.INITIAL_MIN_DURATION - elapsed
        );

        // 确保至少显示最小时长，然后隐藏加载动画
        setTimeout(() => {
          setPageReady(true);
          setIsInitialLoading(false);
          sessionStorage.setItem('hasVisited', 'true');
        }, remaining);
      };

      // 信号1：document.readyState
      if (document.readyState === 'complete') {
        completeLoading();
      } else {
        window.addEventListener('load', completeLoading, { once: true });
      }

      // 信号2：给一个最大等待时间（品牌动画时长）
      const maxTimer = setTimeout(() => {
        completeLoading();
      }, LOADING_CONFIG.INITIAL_BRAND_ANIMATION);

      // 信号3：requestIdleCallback（如果支持）
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // 等待一帧，确保首屏渲染完成
          requestAnimationFrame(() => {
            completeLoading();
          });
        });
      }

      return () => {
        window.removeEventListener('load', completeLoading);
        clearTimeout(maxTimer);
      };
    }
  }, []);

  // 未挂载时不渲染任何内容
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* 首次加载动画 - 使用固定定位覆盖在内容上方 */}
      {isInitialLoading && (
        <PageLoading
          onComplete={() => {
            // 页面加载动画完成，标记为可以显示内容
            setPageReady(true);
            setTimeout(() => {
              setIsInitialLoading(false);
            }, 500); // 等待淡出动画完成
          }}
          minDuration={LOADING_CONFIG.INITIAL_MIN_DURATION}
          maxDuration={LOADING_CONFIG.INITIAL_BRAND_ANIMATION}
        />
      )}

      {/* 路由切换加载动画 */}
      <RouteLoading />

      {/* 页面内容 - 始终渲染，但使用 opacity 控制可见性 */}
      <div
        style={{
          opacity: pageReady ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
        }}
      >
        {children}
      </div>
    </>
  );
}
