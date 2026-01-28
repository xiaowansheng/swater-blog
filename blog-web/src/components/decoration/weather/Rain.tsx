'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Raindrop {
  id: number;
  x: number;
  delay: number;
  duration: number;
  length: number;
}

export default function Rain() {
  const [raindrops, setRaindrops] = useState<Raindrop[]>([]);

  useEffect(() => {
    // Initial drops
    const initialDrops = Array.from({ length: 100 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.5 + Math.random() * 0.5,
      length: 10 + Math.random() * 20,
    }));
    setRaindrops(initialDrops);

    const interval = setInterval(() => {
        setRaindrops(prev => [...prev.slice(-100), {
            id: Date.now(),
            x: Math.random() * 100,
            delay: 0,
            duration: 0.5 + Math.random() * 0.5,
            length: 10 + Math.random() * 20,
        }]);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {Array.from({ length: 100 }).map((_, i) => (
         <motion.div
            key={i}
            initial={{ 
              top: -100, 
              left: `${Math.random() * 100}%`,
              opacity: 0.7 
            }}
            animate={{ 
              top: '120%',
              opacity: 0.7
            }}
            transition={{ 
              duration: 0.8 + Math.random() * 0.5, 
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2
            }}
            style={{ 
                position: 'absolute',
                width: '1px',
                height: `${10 + Math.random() * 20}px`,
                background: 'linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.8))'
            }}
          />
      ))}
    </div>
  );
}
