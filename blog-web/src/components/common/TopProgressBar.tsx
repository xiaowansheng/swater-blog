'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { LOADING_CONFIG } from '@/lib/constants/loading';

/**
 * 顶部进度条组件
 * 
 * 特性：
 * - 直接监听路由变化，不依赖全局 loading 状态
 * - 模拟进度增长到 90%，路由完成后快速到 100%
 * - 更敏捷的响应，不受最小时长限制
 */
export default function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    if (!previousPathname || previousPathname === pathname) return;

    let interval: number | undefined;
    let resetTimer: number | undefined;

    // Schedule state changes after the route effect has committed.
    const startFrame = window.requestAnimationFrame(() => {
      setIsLoading(true);
      setProgress(0);

      interval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= LOADING_CONFIG.PROGRESS_MAX_BEFORE_COMPLETE) {
            if (interval !== undefined) window.clearInterval(interval);
            return LOADING_CONFIG.PROGRESS_MAX_BEFORE_COMPLETE;
          }
          // 随机增长，越接近 90% 增长越慢
          const increment = Math.random() * (30 - prev / 3);
          return Math.min(prev + increment, LOADING_CONFIG.PROGRESS_MAX_BEFORE_COMPLETE);
        });
      }, LOADING_CONFIG.PROGRESS_INTERVAL);
    });

    const completeTimer = window.setTimeout(() => {
      setProgress(100);
      resetTimer = window.setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    }, 300);

    return () => {
      window.cancelAnimationFrame(startFrame);
      if (interval !== undefined) window.clearInterval(interval);
      window.clearTimeout(completeTimer);
      if (resetTimer !== undefined) window.clearTimeout(resetTimer);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {(isLoading || progress > 0) && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-primary via-accent to-deco-pink"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: progress / 100, 
            opacity: 1 
          }}
          exit={{ 
            scaleX: 1, 
            opacity: 0,
            transition: { duration: 0.3 }
          }}
          style={{ 
            transformOrigin: 'left',
            backgroundSize: '200% 100%'
          }}
          transition={{ 
            scaleX: { duration: 0.3, ease: 'easeOut' },
            opacity: { duration: 0.1 }
          }}
        >
          {/* 彩虹光效动画 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
          
          {/* 闪光点装饰 */}
          <motion.div
            className="absolute top-0 right-0 w-2 h-1 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
