'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClickEffect {
  id: number;
  x: number;
  y: number;
  word: string;
}

const WORDS = ['❤', '✨', '🌸', '⭐', '🎵', '💫'];

export default function ClickEffects() {
  const [effects, setEffects] = useState<ClickEffect[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newEffect = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        word: WORDS[Math.floor(Math.random() * WORDS.length)],
      };
      
      setEffects(prev => [...prev, newEffect]);
      
      // Auto cleanup after animation
      setTimeout(() => {
        setEffects(prev => prev.filter(item => item.id !== newEffect.id));
      }, 1000);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      <AnimatePresence>
        {effects.map((effect) => (
          <motion.div
            key={effect.id}
            initial={{ opacity: 1, y: effect.y - 10, x: effect.x }}
            animate={{ 
              opacity: 0, 
              y: effect.y - 100,
              scale: [1, 1.5, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute text-xl font-bold select-none text-primary pointer-events-none shadow-sm"
            style={{ 
              color: `hsl(${Math.random() * 360}, 70%, 70%)` 
            }}
          >
            {effect.word}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
