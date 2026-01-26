'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { getFullUrl } from '@/lib/utils/format';
import { useRef } from 'react';

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
    const articlesElement = document.getElementById('articles');
    if (articlesElement) {
      articlesElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center text-sm text-muted">
            <div className="flex gap-2 items-center px-4 py-2 rounded-full border backdrop-blur-sm transition-all bg-card/50 border-border/50 hover:border-primary/50 hover:bg-primary/5 group">
              <svg className="w-4 h-4 transition-transform text-primary group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{articleCount} {t('articleCount')}</span>
            </div>
            <div className="flex gap-2 items-center px-4 py-2 rounded-full border backdrop-blur-sm transition-all bg-card/50 border-border/50 hover:border-primary/50 hover:bg-primary/5 group">
              <svg className="w-4 h-4 transition-transform text-primary group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>{tagCount} {t('tagCount')}</span>
            </div>
            <div className="flex gap-2 items-center px-4 py-2 rounded-full border backdrop-blur-sm transition-all bg-card/50 border-border/50 hover:border-primary/50 hover:bg-primary/5 group">
              <svg className="w-4 h-4 transition-transform text-primary group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>{categoryCount} {t('categoryCount')}</span>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            className="mt-12"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3 // Wait for entrance
            }}
          >
            <button
              onClick={handleScrollToContent}
              className="inline-block cursor-pointer"
              aria-label={t('scrollToContent')}
            >
              <svg className="mx-auto w-6 h-6 transition-colors text-primary/60 hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
