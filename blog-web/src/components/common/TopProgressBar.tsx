'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimpleRouteLoading } from '@/lib/hooks/useSimpleRouteLoading';

export default function TopProgressBar() {
  const { isLoading } = useSimpleRouteLoading();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      // 重置进度
      setProgress(0);
      
      // 模拟进度增长
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // 停在 90%，等待路由完成
          }
          return prev + Math.random() * 30;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      // 路由完成，快速完成进度条
      setProgress(100);
      const timer = setTimeout(() => {
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {(isLoading || progress > 0) && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-primary via-accent to-primary"
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
          {/* 光效动画 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}