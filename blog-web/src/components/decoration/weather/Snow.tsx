'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Snow() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {Array.from({ length: 50 }).map((_, i) => (
         <motion.div
            key={i}
            initial={{ 
              top: -20, 
              left: `${Math.random() * 100}%`,
              opacity: 0 
            }}
            animate={{ 
              top: '110%',
              left: `${Math.random() * 100}%`,
              opacity: [0, 0.8, 0],
            }}
            transition={{ 
              duration: 5 + Math.random() * 10, 
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            className="absolute bg-white rounded-full blur-[1px]"
            style={{ 
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)'
            }}
          />
      ))}
    </div>
  );
}
