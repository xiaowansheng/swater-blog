'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimpleRouteLoading } from '@/lib/hooks/useSimpleRouteLoading';
import { useTranslations } from 'next-intl';

export default function RouteLoading() {
  const t = useTranslations('common');
  const { isLoading } = useSimpleRouteLoading();
  const [currentMascot, setCurrentMascot] = useState(0);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  // 可爱的二次元表情和文字
  const mascots = ['(◕‿◕✿)', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '(*^▽^*)', '(≧◡≦)', '(◡ ‿ ◡ ✿)'];
  const loadingTexts = [
    t('pageLoadingText1'),
    t('pageLoadingText2'),
    t('pageLoadingText3'),
    t('pageLoadingText4'),
    t('pageLoadingText5')
  ];

  useEffect(() => {
    if (isLoading) {
      // 生成随机闪光点
      const newSparkles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      }));
      setSparkles(newSparkles);

      // 切换表情动画
      const interval = setInterval(() => {
        setCurrentMascot((prev) => (prev + 1) % mascots.length);
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isLoading, mascots.length]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-gradient-to-br from-pink-50/95 via-purple-50/95 to-blue-50/95 backdrop-blur-md"
        >
          {/* 背景装饰 - 更加分散和柔和 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* 渐变光晕 - 更大更柔和 */}
            <motion.div
              className="absolute top-1/6 left-1/6 w-96 h-96 bg-gradient-to-r from-pink-300/20 to-purple-300/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-1/6 right-1/6 w-96 h-96 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl"
              animate={{
                scale: [1.3, 1, 1.3],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 4,
              }}
            />

            {/* 闪光特效 - 减少数量，增加间距 */}
            {sparkles.map((sparkle) => (
              <motion.div
                key={sparkle.id}
                className="absolute w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
                style={{
                  left: `${sparkle.x}%`,
                  top: `${sparkle.y}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: sparkle.delay,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* 浮动的小装饰 - 更加分散 */}
            {['✨', '💫', '⭐', '🌸', '💖'].map((emoji, i) => (
              <motion.div
                key={i}
                className="absolute text-xl opacity-60"
                style={{
                  left: `${15 + i * 18}%`,
                  top: `${15 + (i % 2) * 70}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: 'easeInOut',
                }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>

          {/* 主要加载内容 - 增加间距 */}
          <div className="relative z-10 flex flex-col items-center">
            {/* 可爱的吉祥物 - 增大间距 */}
            <motion.div
              className="relative mb-12"
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
                className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-200/80 via-purple-200/80 to-blue-200/80 backdrop-blur-sm border-3 border-white/50 flex items-center justify-center shadow-2xl shadow-pink-300/30"
                whileHover={{ scale: 1.1 }}
                animate={{
                  boxShadow: [
                    '0 25px 50px rgba(236, 72, 153, 0.25)',
                    '0 25px 50px rgba(147, 51, 234, 0.25)',
                    '0 25px 50px rgba(59, 130, 246, 0.25)',
                    '0 25px 50px rgba(236, 72, 153, 0.25)',
                  ],
                }}
                transition={{
                  boxShadow: { duration: 4, repeat: Infinity },
                }}
              >
                <motion.span
                  key={currentMascot}
                  className="text-4xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  {mascots[currentMascot]}
                </motion.span>
              </motion.div>

              {/* 围绕的小星星 - 增大轨道半径 */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 text-yellow-400 opacity-70"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    rotate: [0, 360],
                    x: [0, Math.cos((i * 90) * Math.PI / 180) * 70],
                    y: [0, Math.sin((i * 90) * Math.PI / 180) * 70],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.3,
                  }}
                >
                  ⭐
                </motion.div>
              ))}
            </motion.div>

            {/* 旋转的魔法圈 - 增大间距和透明度 */}
            <motion.div
              className="absolute w-40 h-40 border-2 border-dashed border-pink-300/40 rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.div
              className="absolute w-52 h-52 border-2 border-dashed border-purple-300/30 rounded-full"
              animate={{ rotate: -360 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* 可爱的加载文字 - 增加间距 */}
            <motion.div
              className="text-center space-y-4"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <motion.p
                key={currentMascot}
                className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              >
                {loadingTexts[currentMascot]}
              </motion.p>
              <p className="text-sm text-gray-500 mt-3">
                {t('preparingContent')}
              </p>
            </motion.div>

            {/* 底部装饰波浪 - 增加间距 */}
            <motion.div
              className="absolute bottom-16 flex gap-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {['🌈', '✨', '💝', '✨', '🌈'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="text-2xl opacity-80"
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2.5,
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