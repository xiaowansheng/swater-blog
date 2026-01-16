'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimpleRouteLoading } from '@/lib/hooks/useSimpleRouteLoading';
import { useTranslations } from 'next-intl';

export default function AnimeRouteLoading() {
  const t = useTranslations('common');
  const { isLoading } = useSimpleRouteLoading();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([]);

  // 超级可爱的动画帧序列
  const animationFrames = [
    { face: '(◕‿◕)', text: t('routeLoadingScene1'), color: 'from-pink-400 to-rose-400' },
    { face: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', text: t('routeLoadingScene2'), color: 'from-purple-400 to-indigo-400' },
    { face: '(*^▽^*)', text: t('routeLoadingScene3'), color: 'from-blue-400 to-cyan-400' },
    { face: '(≧◡≦)', text: t('routeLoadingScene4'), color: 'from-green-400 to-emerald-400' },
    { face: '(◡ ‿ ◡ ✿)', text: t('routeLoadingScene5'), color: 'from-yellow-400 to-orange-400' },
  ];

  useEffect(() => {
    if (isLoading) {
      // 生成爱心特效
      const newHearts = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        size: 0.8 + Math.random() * 0.4,
      }));
      setHearts(newHearts);

      // 动画帧切换
      const interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % animationFrames.length);
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isLoading, animationFrames.length]);

  const currentAnimation = animationFrames[currentFrame];

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-gradient-to-br from-pink-100/90 via-purple-100/90 to-blue-100/90 backdrop-blur-lg"
        >
          {/* 动态背景 */}
          <div className="absolute inset-0 overflow-hidden">
            {/* 彩虹波浪背景 */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: `
                  radial-gradient(circle at 20% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)
                `,
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* 浮动爱心 */}
            {hearts.map((heart) => (
              <motion.div
                key={heart.id}
                className="absolute text-pink-400"
                style={{
                  left: `${heart.x}%`,
                  top: `${heart.y}%`,
                  fontSize: `${heart.size}rem`,
                }}
                animate={{
                  y: [0, -100, -200],
                  opacity: [0, 1, 0],
                  rotate: [0, 360],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: heart.delay,
                  ease: 'easeOut',
                }}
              >
                💖
              </motion.div>
            ))}

            {/* 星星雨 */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-300 text-lg"
                style={{
                  left: `${10 + i * 10}%`,
                  top: '-5%',
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  rotate: [0, 720],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'linear',
                }}
              >
                ⭐
              </motion.div>
            ))}
          </div>

          {/* 主要内容区域 */}
          <div className="relative z-10 flex flex-col items-center">
            {/* 魔法阵背景 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-80 h-80 border-2 border-dashed border-pink-300/50 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute w-60 h-60 border-2 border-dotted border-purple-300/50 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute w-40 h-40 border-2 border-solid border-blue-300/50 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* 中央角色 */}
            <motion.div
              className="relative z-20 mb-8"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <motion.div
                className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentAnimation.color} backdrop-blur-sm border-4 border-white/60 flex items-center justify-center shadow-2xl`}
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(236, 72, 153, 0.5)',
                    '0 0 50px rgba(147, 51, 234, 0.5)',
                    '0 0 30px rgba(59, 130, 246, 0.5)',
                    '0 0 30px rgba(236, 72, 153, 0.5)',
                  ],
                }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity },
                }}
              >
                <motion.span
                  key={currentFrame}
                  className="text-5xl text-white"
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 180, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  {currentAnimation.face}
                </motion.span>
              </motion.div>

              {/* 围绕的魔法符文 */}
              {['✨', '🌟', '💫', '⭐', '🔮', '🌙'].map((symbol, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    rotate: [0, 360],
                    x: [0, Math.cos((i * 60) * Math.PI / 180) * 80],
                    y: [0, Math.sin((i * 60) * Math.PI / 180) * 80],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.2,
                  }}
                >
                  {symbol}
                </motion.div>
              ))}
            </motion.div>

            {/* 动态文字 */}
            <motion.div
              className="text-center space-y-3"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.h2
                key={currentFrame}
                className={`text-2xl font-bold bg-gradient-to-r ${currentAnimation.color} bg-clip-text text-transparent`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              >
                {currentAnimation.text}
              </motion.h2>
              <p className="text-gray-600 text-sm">
                {t('castingTeleportMagic')}
              </p>
            </motion.div>

            {/* 底部进度指示器 */}
            <motion.div
              className="mt-8 flex gap-2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {animationFrames.map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i === currentFrame ? 'bg-pink-400' : 'bg-gray-300'
                  }`}
                  animate={{
                    scale: i === currentFrame ? [1, 1.3, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: i === currentFrame ? Infinity : 0,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}