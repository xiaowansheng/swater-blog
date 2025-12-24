'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { useTheme } from '@/lib/utils/theme';
import { useState, useEffect } from 'react';
import { usePathname } from '@/lib/i18n/routing';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const { theme, toggleTheme, mounted } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/zh' || pathname === '/en';

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDifference = Math.abs(currentScrollY - lastScrollY);
          
          if (isHomePage) {
            setScrolled(currentScrollY > 100);
            
            if (currentScrollY < 100) {
              setVisible(true);
            } else if (currentScrollY > lastScrollY && scrollDifference > 10) {
              setVisible(false);
            } else if (currentScrollY < lastScrollY && scrollDifference > 10) {
              setVisible(true);
            }
          } else {
            setScrolled(true);
            
            if (currentScrollY < 50) {
              setVisible(true);
            } else if (currentScrollY > lastScrollY && scrollDifference > 10) {
              setVisible(false);
            } else if (currentScrollY < lastScrollY && scrollDifference > 10) {
              setVisible(true);
            }
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    if (isHomePage) {
      handleScroll();
    } else {
      setScrolled(true);
      setVisible(true);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, lastScrollY]);

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled 
          ? 'glass-effect border-b border-border/30 shadow-xl backdrop-blur-xl' 
          : 'bg-transparent border-b border-transparent'
      } ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className={`absolute inset-0 transition-opacity duration-500 ${
        scrolled ? 'opacity-100 bg-gradient-to-r from-primary/5 via-transparent to-accent/5' : 'opacity-0'
      }`}></div>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 relative z-10">
        <Link href="/" className={`text-xl font-bold transition-all hover:scale-110 relative group ${
          scrolled ? 'gradient-text' : 'text-white drop-shadow-lg'
        }`}>
          <span className="relative z-10 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse ${
              scrolled ? '' : 'bg-white'
            }`}></span>
            Swater Blog
          </span>
          <span className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-60 bg-gradient-to-r from-primary to-accent transition-opacity duration-300"></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className={`px-4 py-2 text-sm font-medium transition-all relative group rounded-xl backdrop-blur-sm ${
            scrolled 
              ? 'text-foreground/70 hover:text-primary hover:bg-primary/10' 
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}>
            {t('home')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </Link>
          <Link href="/post" className={`px-4 py-2 text-sm font-medium transition-all relative group rounded-xl backdrop-blur-sm ${
            scrolled 
              ? 'text-foreground/70 hover:text-primary hover:bg-primary/10' 
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}>
            {t('posts')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </Link>
          <Link href="/category" className={`px-4 py-2 text-sm font-medium transition-all relative group rounded-xl backdrop-blur-sm ${
            scrolled 
              ? 'text-foreground/70 hover:text-primary hover:bg-primary/10' 
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}>
            {t('categories')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </Link>
          <Link href="/tag" className={`px-4 py-2 text-sm font-medium transition-all relative group rounded-xl backdrop-blur-sm ${
            scrolled 
              ? 'text-foreground/70 hover:text-primary hover:bg-primary/10' 
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}>
            {t('tags')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </Link>
          <Link href="/archive" className={`px-4 py-2 text-sm font-medium transition-all relative group rounded-xl backdrop-blur-sm ${
            scrolled 
              ? 'text-foreground/70 hover:text-primary hover:bg-primary/10' 
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}>
            {t('archives')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </Link>
          <Link href="/about" className={`px-4 py-2 text-sm font-medium transition-all relative group rounded-xl backdrop-blur-sm ${
            scrolled 
              ? 'text-foreground/70 hover:text-primary hover:bg-primary/10' 
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}>
            {t('about')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className={scrolled ? '' : '[&_select]:text-white [&_select]:border-white/20 [&_select]:bg-white/10'}>
            <LanguageSwitcher />
          </div>
          {mounted && (
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 relative overflow-hidden group ${
              scrolled 
                ? 'hover:bg-secondary/50' 
                : 'hover:bg-white/10 text-white'
            }`}
            aria-label="Toggle theme"
          >
            <span className="relative z-10 text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${
              scrolled 
                ? 'hover:bg-secondary/50' 
                : 'hover:bg-white/10 text-white'
            }`}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}

