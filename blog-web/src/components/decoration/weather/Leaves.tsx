'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Leaf {
  id: number;
  xStart: number;
  xEnd: number;
  rotateStart: number;
  rotateEnd: number;
  duration: number;
  delay: number;
  size: number;
  colorClass: string;
}

export default function Leaves() {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  // 在 Mount 后的 useEffect 中异步生成粒子配置，确保 render 函数纯净并符合 react-hooks 规则
  useEffect(() => {
    const generated = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      xStart: Math.random() * 100,
      xEnd: Math.random() * 100 + (Math.random() * 40 - 20),
      rotateStart: Math.random() * 360,
      rotateEnd: Math.random() * 720,
      duration: 8 + Math.random() * 7,
      delay: Math.random() * 5,
      size: 15 + Math.random() * 15,
      colorClass: Math.random() > 0.5 ? "text-orange-500/60" : "text-amber-700/60",
    }));
    Promise.resolve().then(() => {
      setLeaves(generated);
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          initial={{ 
            top: -50, 
            left: `${leaf.xStart}%`,
            opacity: 0,
            rotate: leaf.rotateStart
          }}
          animate={{ 
            top: '110%',
            left: `${leaf.xEnd}%`, // Drift
            opacity: [0, 0.8, 0.8, 0],
            rotate: leaf.rotateEnd
          }}
          transition={{ 
            duration: leaf.duration, 
            repeat: Infinity,
            ease: "linear",
            delay: leaf.delay
          }}
          style={{ position: 'absolute' }}
        >
          <svg
            width={leaf.size}
            height={leaf.size}
            viewBox="0 0 24 24"
            fill="none"
            className={leaf.colorClass}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C12 2 13 8 18 10C23 12 22 18 22 18C22 18 16 17 12 22C8 17 2 18 2 18C2 18 1 12 6 10C11 8 12 2 12 2Z"
              fill="currentColor"
            />
            <path d="M12 2V22" stroke="currentColor" strokeOpacity="0.5" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
