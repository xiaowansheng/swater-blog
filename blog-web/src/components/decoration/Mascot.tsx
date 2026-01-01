'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMascotSystem } from '@/lib/hooks/useMascotSystem';

export default function Mascot() {
  const { bubbleText, isVisible, interact, isHappy, expression } = useMascotSystem();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {(isVisible || isHovered) && bubbleText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            className="mb-4 px-4 py-2 bg-background/90 backdrop-blur-md border border-primary/20 rounded-2xl shadow-xl shadow-primary/5 text-sm font-bold font-title text-primary relative max-w-[200px]"
          >
            {bubbleText}
            {/* Triangle for bubble */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-background border-r border-b border-primary/20 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={interact}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9, rotate: -5 }}
        animate={isHappy ? {
          y: [0, -10, 0],
          transition: { duration: 0.5, repeat: 2 }
        } : {}}
        className="w-16 h-16 bg-background/80 rounded-full border-2 border-primary/30 flex items-center justify-center cursor-pointer pointer-events-auto backdrop-blur-md group overflow-hidden relative shadow-lg shadow-primary/10"
      >
        {/* Placeholder for Mascot */}
        <span className="text-3xl transition-transform group-hover:scale-110 select-none">
          {isHappy ? '✨' : expression}
        </span>
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Particle effects when happy */}
        {isHappy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-deco-pink rounded-full animate-ping"></div>
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-deco-yellow rounded-full animate-bounce"></div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}