'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
}

export default function SakuraRain() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const generatePetals = () => {
      const newPetals = Array.from({ length: 25 }).map((_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100, // percentage
        delay: Math.random() * 10,
        duration: 10 + Math.random() * 10,
        size: 10 + Math.random() * 15,
        rotate: Math.random() * 360,
      }));
      setPetals(newPetals);
    };

    generatePetals();
    const interval = setInterval(generatePetals, 20000); // Regenerate every 20s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            initial={{ 
              top: -50, 
              left: `${petal.x}%`, 
              opacity: 0,
              rotate: petal.rotate 
            }}
            animate={{ 
              top: '110%', 
              left: `${petal.x + (Math.random() * 20 - 10)}%`,
              opacity: [0, 0.7, 0.7, 0],
              rotate: petal.rotate + 360
            }}
            transition={{ 
              duration: petal.duration, 
              delay: petal.delay,
              ease: "linear",
              repeat: Infinity
            }}
            style={{ position: 'absolute' }}
          >
            <svg
              width={petal.size}
              height={petal.size}
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-deco-pink/40"
            >
              <path
                d="M20 40C20 40 40 30 40 15C40 5 32 0 25 0C20 0 17 5 15 8C13 5 10 0 5 0C-2 0 0 15 0 25C0 35 20 40 20 40Z"
                fill="currentColor"
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}