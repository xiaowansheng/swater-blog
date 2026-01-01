'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function CornerDecoration() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top Left Decoration */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"
      />
      
      {/* Bottom Right Decoration */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute -bottom-12 -right-12 w-64 h-64 bg-deco-pink/5 rounded-full blur-3xl"
      />

      {/* Top Right Decorative Shape */}
      <div className="absolute top-10 right-10 flex gap-3">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-3 h-3 rounded-full bg-primary/20"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, -15, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="w-2 h-2 rounded-full bg-deco-pink/20"
        />
      </div>

      {/* Bottom Left Decorative Shape */}
      <div className="absolute bottom-20 left-10 flex flex-col gap-3">
        <motion.div 
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-4 rounded-lg rotate-45 border-2 border-primary/10"
        />
      </div>
    </div>
  );
}