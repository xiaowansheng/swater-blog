'use client';

import React, { useEffect, useState } from 'react';
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
  const [prevPathname, setPrevPathname] = useState<string | undefined>(undefined);

  useEffect(() => {
    // 路由开始变化
    if (prevPathname && prevPathname !== pathname) {
      setIsLoading(true);
      setProgress(0);

      // 模拟进度增长
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= LOADING_CONFIG.PROGRESS_MAX_BEFORE_COMPLETE) {
            clearInterval(interval);
            return LOADING_CONFIG.PROGRESS_MAX_BEFORE_COMPLETE;
          }
          // 随机增长，越接近 90% 增长越慢
          const increment = Math.random() * (30 - prev / 3);
          return Math.min(prev + increment, LOADING_CONFIG.PROGRESS_MAX_BEFORE_COMPLETE);
        });
      }, LOADING_CONFIG.PROGRESS_INTERVAL);

      return () => clearInterval(interval);
    }

    setPrevPathname(pathname);
  }, [pathname, prevPathname]);

  useEffect(() => {
    // 路由完成，快速完成进度条
    if (isLoading && prevPathname && prevPathname !== pathname) {
      setProgress(100);
      
      const timer = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPathname, isLoading]);

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