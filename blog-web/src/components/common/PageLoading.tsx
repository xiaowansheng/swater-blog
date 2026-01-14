'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageLoadingProps {
  onComplete?: () => void;
  minDuration?: number;
  maxDuration?: number;
}

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

interface Star {
  id: number;
  x: number;
  y: number;
  delay: number;
  scale: number;
}

export default function PageLoading({ 
  onComplete, 
  minDuration = 800,
  maxDuration = 3000 
}: PageLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScene, setCurrentScene] = useState(0);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [mounted, setMounted] = useState(false);

  // 首屏加载的故事场景
  const loadingScenes = [
    { 
      mascot: '(◕‿◕)', 
      text: '欢迎来到我的小世界', 
      subtext: '正在准备魔法道具...',
      color: 'from-pink-400 via-rose-400 to-pink-500',
      bgColor: 'from-pink-100/80 via-rose-100/80 to-pink-200/80'
    },
    { 
      mascot: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', 
      text: '施展召唤咒语中', 
      subtext: '正在连接异次元服务器...',
      color: 'from-purple-400 via-violet-400 to-purple-500',
      bgColor: 'from-purple-100/80 via-violet-100/80 to-purple-200/80'
    },
    { 
      mascot: '(*^▽^*)', 
      text: '收集彩虹能量', 
      subtext: '正在加载精彩内容...',
      color: 'from-blue-400 via-cyan-400 to-blue-500',
      bgColor: 'from-blue-100/80 via-cyan-100/80 to-blue-200/80'
    },
    { 
      mascot: '(≧◡≦)', 
      text: '编织梦想之网', 
      subtext: '马上就要完成啦...',
      color: 'from-green-400 via-emerald-400 to-green-500',
      bgColor: 'from-green-100/80 via-emerald-100/80 to-green-200/80'
    },
    { 
      mascot: '(◡ ‿ ◡ ✿)', 
      text: '准备就绪！', 
      subtext: '欢迎进入我的博客世界 ♡',
      color: 'from-yellow-400 via-orange-400 to-yellow-500',
      bgColor: 'from-yellow-100/80 via-orange-100/80 to-yellow-200/80'
    },
  ];

  useEffect(() => {
    // 标记组件已挂载
    setMounted(true);

    // 生成樱花花瓣
    const generatedPetals = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3,
      size: 12 + Math.random() * 16,
    }));
    setPetals(generatedPetals);

    // 生成星星
    const generatedStars = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      scale: 0.5 + Math.random() * 1,
    }));
    setStars(generatedStars);

    const startTime = Date.now();

    // 进度条动画
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 150);

    // 场景切换
    const sceneInterval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % loadingScenes.length);
    }, 1200);

    // 完成加载（使用 maxDuration 作为最大等待时间）
    const timer = setTimeout(() => {
      setProgress(100);
      
      // 确保至少显示 minDuration
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
        onComplete?.();
      }, remaining);
    }, maxDuration);

    return () => {
      clearInterval(interval);
      clearInterval(sceneInterval);
      clearTimeout(timer);
    };
  }, [minDuration, maxDuration, onComplete, loadingScenes.length]);

  // 在挂载前不渲染内容，避免 hydration mismatch
  if (!mounted) {
    return null;
  }

  const currentSceneData = loadingScenes[currentScene];

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br ${currentSceneData.bgColor} backdrop-blur-md`}
        >
          {/* 动态背景装饰 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* 多层渐变光晕 */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-pink-300/30 via-purple-300/30 to-blue-300/30 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.5, 1.2, 1],
                rotate: [0, 90, 180, 270, 360],
                x: [0, 50, -30, 20, 0],
                y: [0, -40, 30, -20, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-yellow-300/25 via-orange-300/25 to-red-300/25 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.4, 1.1],
                rotate: [360, 270, 180, 90, 0],
                x: [0, -60, 40, -30, 0],
                y: [0, 50, -40, 30, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 3,
              }}
            />

            {/* 樱花雨 */}
            {petals.map((petal) => (
              <motion.div
                key={petal.id}
                className="absolute top-0 text-pink-300/60"
                style={{
                  left: `${petal.left}%`,
                  fontSize: `${petal.size}px`,
                }}
                animate={{
                  y: ['-10vh', '110vh'],
                  rotate: [0, 360, 720],
                  x: [0, Math.sin(petal.id) * 80, Math.cos(petal.id) * 60],
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

            {/* 闪烁星星 */}
            {stars.map((star) => (
              <motion.div
                key={star.id}
                className="absolute text-yellow-300/70"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  fontSize: `${star.scale}rem`,
                }}
                animate={{
                  opacity: [0, 1, 0.3, 1, 0],
                  scale: [0.5, 1.2, 0.8, 1.5, 0.5],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ✨
              </motion.div>
            ))}

            {/* 浮动装饰元素 */}
            {['🦄', '🌙', '⭐', '💫', '🔮', '🌈', '💖', '🎀'].map((emoji, i) => (
              <motion.div
                key={i}
                className="absolute text-3xl opacity-40"
                style={{
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${15 + Math.floor(i / 4) * 35}%`,
                }}
                animate={{
                  y: [0, -40, 0],
                  rotate: [0, 360],
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 5 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: 'easeInOut',
                }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>

          {/* 主要内容区域 */}
          <div className="relative z-10 flex flex-col items-center max-w-md mx-auto px-8">
            {/* 主角色区域 */}
            <motion.div
              className="relative mb-16"
              animate={{
                y: [0, -25, 0],
                rotate: [0, 3, -3, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* 魔法阵背景 */}
              <motion.div
                className="absolute inset-0 w-48 h-48 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-full h-full border-2 border-dashed border-pink-300/40 rounded-full" />
                <div className="absolute inset-4 border-2 border-dotted border-purple-300/40 rounded-full" />
                <div className="absolute inset-8 border-2 border-solid border-blue-300/40 rounded-full" />
              </motion.div>

              {/* 主角色 */}
              <motion.div
                className={`w-40 h-40 rounded-full bg-gradient-to-br ${currentSceneData.color} backdrop-blur-sm border-4 border-white/70 flex items-center justify-center shadow-2xl relative z-10`}
                animate={{
                  boxShadow: [
                    '0 30px 60px rgba(236, 72, 153, 0.4)',
                    '0 30px 60px rgba(147, 51, 234, 0.4)',
                    '0 30px 60px rgba(59, 130, 246, 0.4)',
                    '0 30px 60px rgba(34, 197, 94, 0.4)',
                    '0 30px 60px rgba(236, 72, 153, 0.4)',
                  ],
                }}
                transition={{
                  boxShadow: { duration: 6, repeat: Infinity },
                }}
              >
                <motion.span
                  key={currentScene}
                  className="text-6xl text-white drop-shadow-lg"
                  initial={{ scale: 0, rotate: -360, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 360, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    duration: 0.8,
                  }}
                >
                  {currentSceneData.mascot}
                </motion.span>
              </motion.div>

              {/* 围绕的魔法元素 */}
              {['🌟', '💫', '✨', '⭐', '🔮', '💖'].map((symbol, i) => (
                <motion.div
                  key={i}
                  className="absolute text-3xl"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    rotate: [0, 360],
                    x: [0, Math.cos((i * 60) * Math.PI / 180) * 100],
                    y: [0, Math.sin((i * 60) * Math.PI / 180) * 100],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.3,
                  }}
                >
                  {symbol}
                </motion.div>
              ))}
            </motion.div>

            {/* 故事文字区域 */}
            <motion.div
              className="text-center space-y-6 mb-12"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.h1
                key={currentScene}
                className={`text-3xl font-bold bg-gradient-to-r ${currentSceneData.color} bg-clip-text text-transparent drop-shadow-sm`}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                }}
              >
                {currentSceneData.text}
              </motion.h1>
              <motion.p
                key={`${currentScene}-sub`}
                className="text-lg text-gray-600 font-medium"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                  delay: 0.2,
                }}
              >
                {currentSceneData.subtext}
              </motion.p>
            </motion.div>

            {/* 进度条区域 */}
            <div className="w-full max-w-sm space-y-4">
              {/* 主进度条 */}
              <div className="h-4 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm border-2 border-white/40 shadow-lg">
                <motion.div
                  className={`h-full bg-gradient-to-r ${currentSceneData.color} rounded-full relative overflow-hidden`}
                  animate={{
                    width: `${progress}%`,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: 'easeOut',
                  }}
                >
                  {/* 进度条光效 */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </motion.div>
              </div>

              {/* 进度信息 */}
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-600">魔法进度</span>
                <motion.span
                  key={Math.floor(progress / 10)}
                  className={`bg-gradient-to-r ${currentSceneData.color} bg-clip-text text-transparent font-bold text-lg`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {Math.floor(progress)}%
                </motion.span>
              </div>
            </div>

            {/* 底部装饰 */}
            <motion.div
              className="absolute bottom-12 flex gap-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              {['🌸', '✨', '🦄', '💖', '🌙', '⭐', '🌈'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="text-2xl opacity-70"
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
