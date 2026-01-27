'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { getFullUrl } from '@/lib/utils/format';
import { useEffect, useRef } from 'react';

interface HeroSectionClientProps {
  siteName: string;
  siteNotice?: string;
  siteDescription?: string;
  coverImage?: string;
  articleCount: number;
  tagCount: number;
  categoryCount: number;
}

export default function HeroSectionClient({
  siteName,
  siteNotice,
  siteDescription,
  coverImage,
  articleCount,
  tagCount,
  categoryCount,
}: HeroSectionClientProps) {
  const t = useTranslations('common');
  const containerRef = useRef<HTMLElement>(null);
  const touchStartYRef = useRef<number | null>(null);
  const snappingRef = useRef(false);
  const { scrollY } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const y3 = useTransform(scrollY, [0, 500], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Entrance variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  const handleScrollToContent = () => {
    // Prefer the specific list anchor, but fall back to the main container.
    const target =
      document.getElementById('article-list') ??
      document.getElementById('articles');
    if (!target) return;

    // Fixed header height is ~64px (h-16). Add a small buffer.
    const headerOffset = 72;
    const top =
      window.scrollY + target.getBoundingClientRect().top - headerOffset;

    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  useEffect(() => {
    const headerOffset = 72;
    const snapToHeroBottom = () => {
      const hero = containerRef.current;
      if (!hero || snappingRef.current) return;

      const heroTop = hero.offsetTop;
      const heroHeight = hero.offsetHeight;
      const heroBottomTop = heroTop + heroHeight - headerOffset;

      snappingRef.current = true;
      window.scrollTo({
        top: Math.max(0, heroBottomTop),
        behavior: 'smooth',
      });

      // Release the lock after the smooth scroll likely completes.
      window.setTimeout(() => {
        snappingRef.current = false;
      }, 700);
    };

    const shouldSnapFromHero = () => {
      const hero = containerRef.current;
      if (!hero) return false;

      const rect = hero.getBoundingClientRect();
      const heroBottomTop = hero.offsetTop + hero.offsetHeight - headerOffset;
      const y = window.scrollY;

      // 只要封面仍在视口内（且还没滚过封面底部），就允许吸附
      const heroInViewport = rect.bottom > headerOffset && rect.top < window.innerHeight;
      const notPastHeroBottom = y < heroBottomTop - 2;

      return heroInViewport && notPastHeroBottom;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY <= 6) return;
      if (!shouldSnapFromHero()) return;
      e.preventDefault();
      snapToHeroBottom();
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      const startY = touchStartYRef.current;
      const currentY = e.touches[0]?.clientY;
      if (startY == null || currentY == null) return;

      const delta = startY - currentY;
      if (delta <= 12) return;
      if (!shouldSnapFromHero()) return;

      e.preventDefault();
      touchStartYRef.current = null;
      snapToHeroBottom();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // 首页封面背景样式
  const fullCoverImage = getFullUrl(coverImage);
  const heroStyle = fullCoverImage ? {
    backgroundImage: `url(${fullCoverImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  return (
    <section ref={containerRef} className="flex overflow-hidden relative justify-center items-center min-h-screen" style={heroStyle}>
      {/* 背景遮罩 */}
      {fullCoverImage ? (
        <div className="absolute inset-0 z-0 bg-black/40"></div>
      ) : (
        <>
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
          <div className="absolute inset-0 z-0 bg-gradient-to-b to-transparent pointer-events-none from-black/15 via-black/5 dark:from-black/30 dark:via-black/10"></div>
        </>
      )}
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-primary/20 mix-blend-screen dark:mix-blend-color-dodge"
          style={{ y: y1 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute right-1/4 bottom-1/4 w-96 h-96 rounded-full blur-3xl bg-accent/20 mix-blend-screen dark:mix-blend-color-dodge"
          style={{ y: y2 }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"
          style={{ y: y3, x: "-50%", translateY: "-50%" }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
      </div>

      <motion.div 
        className="flex absolute inset-0 z-10 justify-center items-center px-4"
        style={{ opacity }}
      >
        <motion.div 
          className="mx-auto w-full max-w-4xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="relative mb-8">
            <div className="inline-block px-4 py-2 mb-4 rounded-full border backdrop-blur-sm transition-all bg-primary/10 border-primary/20 hover:bg-primary/20">
              <span className="flex gap-2 items-center text-sm font-medium text-primary">
                <span className="w-2 h-2 rounded-full animate-pulse bg-primary"></span>
                {siteNotice || t('welcomeToBlog')}
              </span>
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="relative mb-6 text-6xl font-black md:text-8xl gradient-text">
            {siteName}
            <span className="absolute -bottom-4 left-1/2 w-32 h-1 bg-gradient-to-r rounded-full opacity-60 -translate-x-1/2 from-primary via-accent to-primary"></span>
          </motion.h1>

          <motion.p variants={itemVariants} className="mb-8 text-xl leading-relaxed md:text-2xl drop-shadow-lg">
            <span className="inline-block px-6 py-2 rounded-lg bg-white/10 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10">
              <span className={fullCoverImage ? "text-white font-medium" : "text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/95 to-foreground/90 font-medium"}>
                {siteDescription || '分享技术，记录生活'}
              </span>
            </span>
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex gap-2.5 items-center px-5 py-2.5 rounded-full border backdrop-blur-md transition-all bg-card/70 dark:bg-card/60 border-border/60 hover:border-primary hover:bg-card/80 dark:hover:bg-card/70 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 group">
              <svg className="w-5 h-5 text-primary dark:text-primary drop-shadow-sm transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold text-foreground/90 dark:text-foreground/95 group-hover:text-foreground drop-shadow-sm">{articleCount} {t('articleCount')}</span>
            </div>
            <div className="flex gap-2.5 items-center px-5 py-2.5 rounded-full border backdrop-blur-md transition-all bg-card/70 dark:bg-card/60 border-border/60 hover:border-primary hover:bg-card/80 dark:hover:bg-card/70 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 group">
              <svg className="w-5 h-5 text-primary dark:text-primary drop-shadow-sm transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-semibold text-foreground/90 dark:text-foreground/95 group-hover:text-foreground drop-shadow-sm">{tagCount} {t('tagCount')}</span>
            </div>
            <div className="flex gap-2.5 items-center px-5 py-2.5 rounded-full border backdrop-blur-md transition-all bg-card/70 dark:bg-card/60 border-border/60 hover:border-primary hover:bg-card/80 dark:hover:bg-card/70 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 group">
              <svg className="w-5 h-5 text-primary dark:text-primary drop-shadow-sm transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="font-semibold text-foreground/90 dark:text-foreground/95 group-hover:text-foreground drop-shadow-sm">{categoryCount} {t('categoryCount')}</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-12 flex justify-center">
            <div className="animate-float">
              <button
                onClick={handleScrollToContent}
                className="relative inline-block cursor-pointer transition-transform hover:scale-110 group"
                aria-label={t('scrollToContent')}
              >
                {/* 呼吸灯光晕效果 */}
                <div className="absolute inset-0 rounded-full blur-xl opacity-0 transition-opacity bg-primary/30 group-hover:opacity-100"></div>
                
                <svg 
                    className="relative z-10 mx-auto w-10 h-10 transition-all text-primary hover:text-primary drop-shadow-[0_0_12px_rgba(var(--primary),0.6)]" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
