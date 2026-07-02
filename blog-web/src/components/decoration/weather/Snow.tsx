'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Snowflake {
  id: number;
  xStart: number;
  xEnd: number;
  duration: number;
  delay: number;
  size: number;
}

export default function Snow() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  // 在 Mount 后的 useEffect 中异步生成粒子配置，确保 render 函数纯净并符合 react-hooks 规则
  useEffect(() => {
    const generated = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      xStart: Math.random() * 100,
      xEnd: Math.random() * 100,
      duration: 5 + Math.random() * 10,
      delay: Math.random() * 5,
      size: 4 + Math.random() * 8,
    }));
    Promise.resolve().then(() => {
      setSnowflakes(generated);
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          initial={{ 
            top: -20, 
            left: `${flake.xStart}%`,
            opacity: 0 
          }}
          animate={{ 
            top: '110%',
            left: `${flake.xEnd}%`,
            opacity: [0, 0.8, 0],
          }}
          transition={{ 
            duration: flake.duration, 
            repeat: Infinity,
            ease: "linear",
            delay: flake.delay
          }}
          className="absolute bg-white rounded-full blur-[1px]"
          style={{ 
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)'
          }}
        />
      ))}
    </div>
  );
}
