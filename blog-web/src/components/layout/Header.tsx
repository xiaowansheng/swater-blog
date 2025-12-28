'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { useTheme } from '@/lib/utils/theme';
import { useState, useEffect } from 'react';
import { usePathname } from '@/lib/i18n/routing';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useSiteConfig } from '@/lib/context/SiteConfigContext';

export default function Header() {
  const t = useTranslations('nav');
  const { site } = useSiteConfig();
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
            setScrolled(currentScrollY > 50);
            
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

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, lastScrollY]);

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled 
          ? 'border-b shadow-xl backdrop-blur-xl glass-effect border-border/30' 
          : 'bg-transparent border-b border-transparent'
      } ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className={`absolute inset-0 transition-opacity duration-500 ${
        scrolled ? 'bg-gradient-to-r via-transparent opacity-100 from-primary/5 to-accent/5' : 'opacity-0'
      }`}></div>
      <div className="container flex relative z-10 justify-between items-center px-4 mx-auto h-16">
        <Link href="/" className={`text-base sm:text-lg md:text-xl font-bold transition-all hover:scale-110 relative group ${
          scrolled ? 'text-foreground' : 'text-white drop-shadow-lg'
        }`}>
          <span className="flex relative z-10 gap-2 items-center">
            <span className={`w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse ${
              scrolled ? '':'bg-white'}`}></span>
            <span className="whitespace-nowrap">{site.name || 'Blog'}</span>
          </span>
          <span className="absolute inset-0 bg-gradient-to-r opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-60 from-primary to-accent"></span>
        </Link>

        <nav className="hidden gap-1 items-center md:flex">
          <Link href="/" className={`px-4 py-2 text-sm font-medium transition-all relative group rounded-xl backdrop-blur-sm ${
            scrolled 
              ? 'text-foreground/70 hover:text-primary hover:bg-primary/10' 
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}>
            {t('home')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
            <span className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 transition-opacity from-primary/0 via-primary/5 to-accent/0 group-hover:opacity-100"></span>
          </Link>
          <Link href="/post" className={`px-4 py-2 text-sm font-medium transition-all relative group rounded-xl backdrop-blur-sm ${
            scrolled 
              ? 'text-foreground/70 hover:text-primary hover:bg-primary/10' 
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}>
            {t('posts')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
            <span className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 transition-opacity from-primary/0 via-primary/5 to-accent/0 group-hover:opacity-100"></span>
          </Link>
          <Link href="/archive" className={`px-4 py-2 text-sm font-medium transition-all relative group rounded-xl backdrop-blur-sm ${
            scrolled 
              ? 'text-foreground/70 hover:text-primary hover:bg-primary/10' 
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}>
            {t('archives')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
            <span className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 transition-opacity from-primary/0 via-primary/5 to-accent/0 group-hover:opacity-100"></span>
          </Link>
          <Link href="/moment" className={`px-4 py-2 text-sm font-medium transition-all relative group rounded-xl backdrop-blur-sm ${
            scrolled 
              ? 'text-foreground/70 hover:text-primary hover:bg-primary/10' 
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}>
            {t('moments')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
            <span className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 transition-opacity from-primary/0 via-primary/5 to-accent/0 group-hover:opacity-100"></span>
          </Link>
          <Link href="/friend-link" className={`px-4 py-2 text-sm font-medium transition-all relative group rounded-xl backdrop-blur-sm ${
            scrolled 
              ? 'text-foreground/70 hover:text-primary hover:bg-primary/10' 
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}>
            {t('friendLinks')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
            <span className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 transition-opacity from-primary/0 via-primary/5 to-accent/0 group-hover:opacity-100"></span>
          </Link>
          <Link href="/about" className={`px-4 py-2 text-sm font-medium transition-all relative group rounded-xl backdrop-blur-sm ${
            scrolled 
              ? 'text-foreground/70 hover:text-primary hover:bg-primary/10' 
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}>
            {t('about')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
            <span className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 transition-opacity from-primary/0 via-primary/5 to-accent/0 group-hover:opacity-100"></span>
          </Link>
        </nav>

        <div className="flex gap-2 items-center">
          <LanguageSwitcher scrolled={scrolled} />
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
            <span className="absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity from-primary/20 to-accent/20 group-hover:opacity-100"></span>
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

