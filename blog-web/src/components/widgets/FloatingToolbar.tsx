'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';


export default function FloatingToolbar() {
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative"
          >
            {/* 可爱的气泡背景 */}
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-200/20 via-purple-200/20 to-blue-200/20 rounded-full blur-lg animate-pulse" />
            
            <button
              onClick={scrollToTop}
              className="relative w-14 h-14 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group overflow-hidden"
              style={{ borderRadius: '50%' }}
              aria-label={t('backToTop')}
            >
              {/* 星星装饰 */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                <div className="absolute top-4 right-2 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-3 left-2 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
              </div>
              
              {/* 主图标 */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
                className="relative z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </motion.div>
              
              {/* 悬停时的光晕效果 */}
              <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            {/* 可爱的小尾巴 */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-60" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主按钮 */}
      <motion.div>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 bg-gradient-to-br from-deco-pink via-primary to-deco-blue text-white shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group overflow-hidden"
        style={{ borderRadius: '50%' }}
        aria-label="Toggle toolbar"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {/* 背景装饰圆环 */}
        <div className="absolute inset-1 border-2 border-white/20 rounded-full" />
        <div className="absolute inset-2 border border-white/10 rounded-full" />
        
        {/* 浮动的小星星 */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-2 right-3 w-1.5 h-1.5 bg-white rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-3 left-2 w-1 h-1 bg-white rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute top-4 left-4 w-0.5 h-0.5 bg-white rounded-full"
            animate={{ 
              scale: [1, 2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        {/* 主图标 */}
        <motion.div
          className="relative z-10"
          animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <motion.svg 
              className="w-7 h-7" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* 二次元风格星星图标 */}
              <motion.svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
              >
                {/* 主星星 */}
                <motion.path
                  d="M12 2L14.5 9.5L22 10L15.5 14.5L17.5 22L12 17.5L6.5 22L8.5 14.5L2 10L9.5 9.5L12 2Z"
                  fill="white"
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                {/* 左上角小星星 */}
                <motion.path
                  d="M6 3L7 5.5L9.5 6L7 6.5L6 9L5 6.5L2.5 6L5 5.5L6 3Z"
                  fill="white"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2
                  }}
                />
                {/* 右下角小星星 */}
                <motion.path
                  d="M19 15L20 17.5L22.5 18L20 18.5L19 21L18 18.5L15.5 18L18 17.5L19 15Z"
                  fill="white"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
              </motion.svg>
            </motion.div>
          )}
        </motion.div>

        {/* 悬停时的彩虹光晕 */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/30 via-purple-400/30 to-blue-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
        
        {/* 点击时的涟漪效果 */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1.5, opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.4 }}
        />
      </motion.button>
      </motion.div>

      {/* 底部装饰 */}
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-deco-pink/40 to-primary/40 rounded-full blur-sm"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}

