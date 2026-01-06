'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageLoadingProps {
  onComplete?: () => void;
  minDuration?: number;
}

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export default function PageLoading({ onComplete, minDuration = 800 }: PageLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMascot, setCurrentMascot] = useState(0);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [mounted, setMounted] = useState(false);

  // 可爱的吉祥物表情序列
  const mascots = ['(≧◡≦)', '(*^▽^*)', '(◕‿◕✿)', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧'];

  useEffect(() => {
    // 标记组件已挂载
    setMounted(true);

    // 生成樱花花瓣（只在客户端）
    const generatedPetals = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      size: 8 + Math.random() * 12,
    }));
    setPetals(generatedPetals);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // 切换吉祥物表情
    const mascotInterval = setInterval(() => {
      setCurrentMascot((prev) => (prev + 1) % mascots.length);
    }, 500);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        onComplete?.();
      }, 300);
    }, minDuration);

    return () => {
      clearInterval(interval);
      clearInterval(mascotInterval);
      clearTimeout(timer);
    };
  }, [minDuration, onComplete]);

  // 在挂载前不渲染内容，避免 hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-md"
        >
          {/* 背景装饰 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* 渐变光晕 */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500" />

            {/* 樱花雨 */}
            {petals.map((petal) => (
              <motion.div
                key={petal.id}
                className="absolute top-0 text-deco-pink/30"
                style={{
                  left: `${petal.left}%`,
                  fontSize: `${petal.size}px`,
                }}
                animate={{
                  y: ['-10vh', '110vh'],
                  rotate: [0, 360],
                  x: [0, Math.sin(petal.id) * 50],
                }}
                transition={{
                  duration: petal.duration,
                  delay: petal.delay,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                🌸
              </motion.div>
            ))}
          </div>

          {/* 主要加载内容 */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* 吉祥物角色 */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              <motion.div
                className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-md border-2 border-primary/30 flex items-center justify-center shadow-2xl shadow-primary/20"
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-6xl">{mascots[currentMascot]}</span>
              </motion.div>

              {/* 闪光特效 */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-deco-yellow rounded-full"
                  animate={{
                    x: [0, (Math.random() - 0.5) * 100],
                    y: [0, (Math.random() - 0.5) * 100],
                    scale: [0, 1, 0],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </motion.div>

            {/* 加载文字 */}
            <motion.div
              className="text-center space-y-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-2xl font-title font-bold text-primary">
                加载中...
              </p>
              <p className="text-sm text-muted">
                正在准备精彩内容 {mascots[currentMascot]}
              </p>
            </motion.div>

            {/* 进度条 */}
            <div className="w-80 space-y-2">
              {/* 进度条背景 */}
              <div className="h-3 bg-secondary/30 rounded-full overflow-hidden backdrop-blur-sm border border-primary/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full relative"
                  style={{
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    width: `${progress}%`,
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    width: { duration: 0.3 },
                    backgroundPosition: { duration: 2, repeat: Infinity },
                  }}
                >
                  {/* 进度条光效 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                </motion.div>
              </div>

              {/* 进度百分比 */}
              <div className="flex justify-between text-xs text-muted">
                <span>准备就绪</span>
                <motion.span
                  key={Math.floor(progress)}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="font-bold text-primary"
                >
                  {Math.floor(progress)}%
                </motion.span>
              </div>
            </div>

            {/* 底部装饰小元素 */}
            <div className="flex gap-4 text-2xl">
              {['✨', '💫', '⭐'].map((emoji, i) => (
                <motion.span
                  key={i}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
