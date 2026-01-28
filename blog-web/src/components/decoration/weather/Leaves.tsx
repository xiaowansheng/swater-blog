'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Leaves() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {Array.from({ length: 30 }).map((_, i) => (
         <motion.div
            key={i}
            initial={{ 
              top: -50, 
              left: `${Math.random() * 100}%`,
              opacity: 0,
              rotate: Math.random() * 360
            }}
            animate={{ 
              top: '110%',
              left: `${Math.random() * 100 + (Math.random() * 40 - 20)}%`, // Drift
              opacity: [0, 0.8, 0.8, 0],
              rotate: Math.random() * 720
            }}
            transition={{ 
              duration: 8 + Math.random() * 7, 
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            style={{ position: 'absolute' }}
          >
             <svg
               width={15 + Math.random() * 15}
               height={15 + Math.random() * 15}
               viewBox="0 0 24 24"
               fill="none"
               className={Math.random() > 0.5 ? "text-orange-500/60" : "text-amber-700/60"}
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
