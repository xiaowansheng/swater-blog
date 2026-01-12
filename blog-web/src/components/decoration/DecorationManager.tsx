'use client';

import React, { useState, useEffect } from 'react';
import { useDecoration } from '@/lib/context/DecorationContext';
import SakuraRain from '@/components/decoration/SakuraRain';
import CornerDecoration from '@/components/decoration/CornerDecoration';
import AnimeMusicPlayer from '@/components/decoration/AnimeMusicPlayer';
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

  return (
    <>
      {/* 音乐播放器 - 不受装饰等级限制，始终可见 */}
      <AnimeMusicPlayer />

      {/* 装饰效果 - 根据装饰等级控制 */}
      {level !== 'none' && !isMobile && (
        <>
          <CornerDecoration />
          {level === 'full' && <SakuraRain />}
        </>
      )}
      {/* <Mascot /> */}
    </>
  );
}