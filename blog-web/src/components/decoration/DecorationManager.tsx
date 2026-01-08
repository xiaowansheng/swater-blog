'use client';

import React, { useState, useEffect } from 'react';
import { useDecoration } from '@/lib/context/DecorationContext';
import SakuraRain from '@/components/decoration/SakuraRain';
import CornerDecoration from '@/components/decoration/CornerDecoration';
// import Mascot from '@/components/decoration/Mascot';

export default function DecorationManager() {
  const { level } = useDecoration();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (level === 'none' || isMobile) return null;

  return (
    <>
      <CornerDecoration />
      {level === 'full' && <SakuraRain />}
      {/* <Mascot /> */}
    </>
  );
}