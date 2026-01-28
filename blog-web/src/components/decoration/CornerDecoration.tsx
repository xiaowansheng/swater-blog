'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function CornerDecoration() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top Left Decoration - 增强的渐变光晕 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute -top-12 -left-12 w-64 h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl"
      />

      {/* Bottom Right Decoration - 增强的渐变光晕 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute -bottom-12 -right-12 w-80 h-80 bg-gradient-to-tl from-deco-pink/20 via-deco-pink/10 to-transparent rounded-full blur-3xl"
      />

      {/* Top Right Decorative Shape - 更明显的圆点 */}
      <div className="absolute top-10 right-10 flex gap-4">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 15, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 shadow-lg shadow-primary/20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -20, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="w-3 h-3 rounded-full bg-gradient-to-br from-deco-pink/30 to-deco-pink/10 shadow-lg shadow-deco-pink/20"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 shadow-lg shadow-accent/20"
        />
      </div>

      {/* Bottom Left Decorative Shape - 更明显的菱形 */}
      <div className="absolute bottom-20 left-10 flex flex-col gap-4">
        <motion.div
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-6 rounded-lg rotate-45 border-2 border-primary/30 bg-primary/5 shadow-lg shadow-primary/10"
        />
        <motion.div
          animate={{
            y: [0, -12, 0],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="w-5 h-5 rounded-lg rotate-45 border-2 border-deco-pink/30 bg-deco-pink/5 shadow-lg shadow-deco-pink/10"
        />
      </div>

      {/* 额外：左上角小装饰 */}
      <div className="absolute top-20 left-16 flex gap-3">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-accent/30 shadow-md shadow-accent/20"
        />
      </div>

      {/* 额外：右下角小装饰 */}
      <div className="absolute bottom-16 right-16 flex gap-3">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="w-2.5 h-2.5 rounded-full bg-primary/30 shadow-md shadow-primary/20"
        />
      </div>
    </div>
  );
}