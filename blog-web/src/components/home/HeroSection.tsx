'use client';

import { useEffect, useState } from 'react';

interface HeroSectionProps {
  articleCount: number;
  tagCount: number;
  categoryCount: number;
}

export default function HeroSection({ articleCount, tagCount, categoryCount }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="flex overflow-hidden relative justify-center items-center min-h-screen">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b to-transparent pointer-events-none from-black/15 via-black/5 dark:from-black/30 dark:via-black/10"></div>
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-primary/20"
          style={{ transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.1}px)` }}
        ></div>
        <div 
          className="absolute right-1/4 bottom-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-accent/20"
          style={{ animationDelay: '1s', transform: `translate(${-scrollY * 0.1}px, ${-scrollY * 0.1}px)` }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s', transform: `translate(-50%, -50%) translateY(${scrollY * 0.05}px)` }}
        ></div>
      </div>
      <div className="flex absolute inset-0 z-10 justify-center items-center px-4">
        <div className="mx-auto w-full max-w-4xl text-center">
          <div className="relative mb-8 animate-fadeIn">
            <div className="inline-block px-4 py-2 mb-4 rounded-full border backdrop-blur-sm transition-all bg-primary/10 border-primary/20 hover:bg-primary/20">
              <span className="flex gap-2 items-center text-sm font-medium text-primary">
                <span className="w-2 h-2 rounded-full animate-pulse bg-primary"></span>
                欢迎来到我的博客
              </span>
            </div>
          </div>
          <h1 className="relative mb-6 text-6xl font-black md:text-8xl gradient-text animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Swater Blog
            <span className="absolute -bottom-4 left-1/2 w-32 h-1 bg-gradient-to-r rounded-full opacity-60 -translate-x-1/2 from-primary via-accent to-primary"></span>
          </h1>
          <p className="mb-8 text-xl leading-relaxed md:text-2xl text-muted animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70">
              分享技术，记录生活
            </span>
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <div className="flex gap-2 items-center px-4 py-2 rounded-full border backdrop-blur-sm transition-all bg-card/50 border-border/50 hover:border-primary/50 hover:bg-primary/5 group">
              <svg className="w-4 h-4 transition-transform text-primary group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{articleCount} 篇文章</span>
            </div>
            <div className="flex gap-2 items-center px-4 py-2 rounded-full border backdrop-blur-sm transition-all bg-card/50 border-border/50 hover:border-primary/50 hover:bg-primary/5 group">
              <svg className="w-4 h-4 transition-transform text-primary group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>{tagCount} 个标签</span>
            </div>
            <div className="flex gap-2 items-center px-4 py-2 rounded-full border backdrop-blur-sm transition-all bg-card/50 border-border/50 hover:border-primary/50 hover:bg-primary/5 group">
              <svg className="w-4 h-4 transition-transform text-primary group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>{categoryCount} 个分类</span>
            </div>
          </div>
          <div className="mt-12 animate-bounce">
            <a href="#articles" className="inline-block">
              <svg className="mx-auto w-6 h-6 transition-colors text-primary/60 hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

