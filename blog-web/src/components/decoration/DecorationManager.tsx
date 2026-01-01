'use client';

import React from 'react';
import { useDecoration } from '@/lib/context/DecorationContext';
import SakuraRain from '@/components/decoration/SakuraRain';
import CornerDecoration from '@/components/decoration/CornerDecoration';
import Mascot from '@/components/decoration/Mascot';

export default function DecorationManager() {
  const { level } = useDecoration();

  if (level === 'none') return null;

  return (
    <>
      <CornerDecoration />
      {level === 'full' && <SakuraRain />}
      <Mascot />
    </>
  );
}