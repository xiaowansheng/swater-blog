'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimpleRouteLoading } from '@/lib/hooks/useSimpleRouteLoading';

export default function RouteLoading() {
  const { isLoading } = useSimpleRouteLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          {/* 简化的加载动画 */}
          <div className="relative">
            {/* 旋转的圆环 */}
            <motion.div
              className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            
            {/* 中心点 */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* 加载文字 */}
          <motion.p
            className="absolute mt-24 text-sm text-muted font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            页面跳转中...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}