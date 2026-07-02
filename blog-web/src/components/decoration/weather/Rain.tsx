'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Raindrop {
  id: number;
  x: number;
  duration: number;
  delay: number;
  length: number;
}

export default function Rain() {
  const [raindrops, setRaindrops] = useState<Raindrop[]>([]);

  // 在 Mount 后的 useEffect 中异步生成粒子配置，确保 render 函数纯净并符合 react-hooks 规则
  useEffect(() => {
    const generated = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      duration: 0.8 + Math.random() * 0.5,
      delay: Math.random() * 2,
      length: 10 + Math.random() * 20,
    }));
    Promise.resolve().then(() => {
      setRaindrops(generated);
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {raindrops.map((drop) => (
        <motion.div
          key={drop.id}
          initial={{ 
            top: -100, 
            left: `${drop.x}%`,
            opacity: 0.7 
          }}
          animate={{ 
            top: '120%',
            opacity: 0.7
          }}
          transition={{ 
            duration: drop.duration, 
            repeat: Infinity,
            ease: "linear",
            delay: drop.delay
          }}
          style={{ 
            position: 'absolute',
            width: '1px',
            height: `${drop.length}px`,
            background: 'linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.8))'
          }}
        />
      ))}
    </div>
  );
}
