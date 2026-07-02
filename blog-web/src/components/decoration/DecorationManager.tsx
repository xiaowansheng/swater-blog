'use client';

import React, { useState, useEffect } from 'react';
import { useDecoration } from '@/lib/context/DecorationContext';
import dynamic from 'next/dynamic';

const ClickEffects = dynamic(() => import('@/components/decoration/ClickEffects'), { ssr: false });
const AnimeMusicPlayer = dynamic(() => import('@/components/decoration/AnimeMusicPlayer'), { ssr: false });
const CornerDecoration = dynamic(() => import('@/components/decoration/CornerDecoration'), { ssr: false });
const CursorFollower = dynamic(() => import('@/components/ui/CursorFollower'), { ssr: false });
const SakuraRain = dynamic(() => import('@/components/decoration/SakuraRain'), { ssr: false });
const Rain = dynamic(() => import('@/components/decoration/weather/Rain'), { ssr: false });
const Snow = dynamic(() => import('@/components/decoration/weather/Snow'), { ssr: false });
const Thunder = dynamic(() => import('@/components/decoration/weather/Thunder'), { ssr: false });
const Leaves = dynamic(() => import('@/components/decoration/weather/Leaves'), { ssr: false });

export default function DecorationManager() {
  const { level, weather } = useDecoration();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderWeather = () => {
    switch (weather) {
        case 'rain': return <Rain />;
        case 'thunder': return <Thunder />;
        case 'snow': return <Snow />;
        case 'leaves': return <Leaves />;
        case 'sakura': 
        default: return <SakuraRain />;
    }
  };

  return (
    <>
      <ClickEffects />
      
      {/* 音乐播放器 - 不受装饰等级限制，始终可见 */}
      <AnimeMusicPlayer />

      {/* 装饰效果 - 根据装饰等级控制 */}
      {level !== 'none' && !isMobile && (
        <>
          <CornerDecoration />
          <CursorFollower level={level === 'light' ? 'light' : 'full'} />
          {level === 'full' && renderWeather()}
          {/* <Mascot /> */}
        </>
      )}
    </>
  );
}