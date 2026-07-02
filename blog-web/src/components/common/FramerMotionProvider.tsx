'use client';

import React from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

export default function FramerMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      {children}
    </LazyMotion>
  );
}
