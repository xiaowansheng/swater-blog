'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

// If cn utility doesn't exist, I'll use a simple version or clsx directly.
// Checking imports in other files, I saw `clsx` in package.json but didn't see usage in the viewed files.
// I'll assume standard className prop usage for now or check for a utility.

interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'ghost';
  hoverEffect?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hoverEffect = true,
  ...props 
}: CardProps) {
  
  const baseStyles = "relative rounded-3xl overflow-hidden transition-all duration-300";
  
  const variants = {
    default: "bg-card border border-card-border shadow-sm dark:shadow-none",
    glass: "glass-effect", // Using the global CSS class
    ghost: "bg-transparent border-none shadow-none"
  };

  const hoverStyles = hoverEffect ? 
    "hover:-translate-y-2 hover:shadow-[0_20px_40px_-12px_var(--color-hover-glow)] hover:border-primary/50" : "";

  return (
    <motion.div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {/* Decorative background gradients similar to global CSS .modern-card */}
      {variant === 'default' && (
        <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02]" />
        </div>
      )}
      
      {children}
    </motion.div>
  );
}
