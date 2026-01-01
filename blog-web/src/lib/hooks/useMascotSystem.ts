'use client';

import { useState, useEffect, useCallback } from 'react';

export interface MascotState {
  bubbleText: string;
  expression: string;
  isHappy: boolean;
}

const GREETINGS = [
  '你好呀~ (oﾟ▽ﾟ)o',
  '欢迎来到我的小窝！',
  '今天也要开心哦~',
  '要不要看看最新的文章？',
  '嘿嘿，被你发现了~',
  '点击我可以换个心情哦！',
  '在这里坐一会儿吧 🍵',
  '发现了一篇很有趣的文章呢！'
];

const CLICK_REACTIONS = [
  '哎呀！被戳到了 (≧▽≦)',
  '哈哈，好痒啊~',
  '继续点我也不会变出金币的 (´･ω･`)',
  '既然你这么诚心，那就送你一朵花吧 🌸',
  '每一天都是新的开始！'
];

export function useMascotSystem() {
  const [state, setState] = useState<MascotState>({
    bubbleText: '',
    expression: '🌱',
    isHappy: false
  });

  const [isVisible, setIsVisible] = useState(false);

  const say = useCallback((text: string) => {
    setState(prev => ({ ...prev, bubbleText: text }));
    setIsVisible(true);
  }, []);

  const interact = useCallback(() => {
    const reaction = CLICK_REACTIONS[Math.floor(Math.random() * CLICK_REACTIONS.length)];
    setState(prev => ({ 
      ...prev, 
      bubbleText: reaction,
      isHappy: true
    }));
    setIsVisible(true);

    // Reset happiness after 2 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, isHappy: false }));
    }, 2000);
  }, []);

  // Show a greeting after a short delay
  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    if (hour >= 5 && hour < 12) timeGreeting = '早上好！今天也要元气满满哦~ ☀️';
    else if (hour >= 12 && hour < 18) timeGreeting = '下午好，要喝杯午后甜点吗？ 🍵';
    else if (hour >= 18 && hour < 22) timeGreeting = '晚上好，忙碌了一天辛苦啦~ ✨';
    else timeGreeting = '熬夜对身体不好，早点休息吧 (´-ω-`)';

    const timer = setTimeout(() => {
      setState(prev => ({
        ...prev,
        bubbleText: timeGreeting || GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
      }));
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Scroll listener for long_read event
  useEffect(() => {
    let hasTriggered = false;
    const handleScroll = () => {
      if (hasTriggered) return;
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent > 0.8) {
        say('读到这里辛苦了！喝杯水休息一下吧~ 🥤');
        hasTriggered = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [say]);

  // Auto-hide bubble after 5 seconds
  useEffect(() => {
    if (isVisible && state.bubbleText) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, state.bubbleText]);

  return {
    ...state,
    isVisible,
    say,
    interact
  };
}