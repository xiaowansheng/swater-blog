'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Rain from './Rain';

export default function Thunder() {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const triggerFlash = () => {
        setFlash(true);
        setTimeout(() => setFlash(false), 200); // Quick flash
        
        // Randomly double flash
        if (Math.random() > 0.7) {
            setTimeout(() => {
                setFlash(true);
                setTimeout(() => setFlash(false), 100);
            }, 300);
        }
    };

    const loop = () => {
        const nextFlash = 5000 + Math.random() * 10000; // 5-15 seconds
        setTimeout(() => {
            triggerFlash();
            loop();
        }, nextFlash);
    };

    loop();
  }, []);

  return (
    <>
        <Rain />
        <div 
            className={`fixed inset-0 pointer-events-none z-[9998] bg-white transition-opacity duration-100 ${flash ? 'opacity-30' : 'opacity-0'}`}
        />
        {/* Darker atmosphere overlay */}
        <div className="fixed inset-0 pointer-events-none z-[0] bg-black/10" />
    </>
  );
}
