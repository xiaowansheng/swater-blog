'use client';

import { Link } from '@/lib/i18n/routing';
import { useTheme } from '@/lib/utils/theme';
import { useState, useEffect } from 'react';
import { usePathname } from '@/lib/i18n/routing';
import { motion } from 'framer-motion';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useDecoration } from '@/lib/context/DecorationContext';

interface NavItem {
  href: string;
  label: string;
}

interface HeaderClientProps {
  siteName: string;
  navItems: NavItem[];
}

export default function HeaderClient({ siteName, navItems }: HeaderClientProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const { level, setLevel } = useDecoration();
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
          ? 'border-b shadow-sm backdrop-blur-xl glass-effect border-primary/10' 
          : 'bg-transparent border-b border-transparent'
      } ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className={`absolute inset-0 transition-opacity duration-500 ${
        scrolled ? 'bg-primary/5 opacity-100' : 'opacity-0'
      }`}></div>
      <div className="container flex relative z-10 justify-between items-center px-6 mx-auto h-16 max-w-7xl">
        <Link href="/" className={`text-xl font-bold transition-all hover:scale-105 relative group font-title ${
          scrolled ? 'text-foreground' : 'text-white drop-shadow-lg'
        }`}>
          <span className="flex relative z-10 gap-2 items-center">
            <span className={`w-2.5 h-2.5 rounded-full bg-primary ${
              scrolled ? 'animate-pulse' : 'bg-white'}`}></span>
            <span className="tracking-tight">{siteName}</span>
          </span>
        </Link>

        <nav className="hidden gap-2 items-center md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname === `/${pathname.split('/')[1]}${item.href}`;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative group ${
                  scrolled 
                    ? isActive ? 'text-primary bg-primary/10' : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                    : isActive ? 'text-white bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                
                {/* Little Stars Hover Effect */}
                <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="absolute animate-twinkle text-[10px]">✨</span>
                </span>
                <span className="absolute -bottom-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none delay-100">
                  <span className="absolute animate-twinkle text-[8px]" style={{ animationDelay: '0.5s' }}>✨</span>
                </span>

                {isActive && (
                  <motion.span 
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full border-2 border-primary/20 pointer-events-none"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex gap-1.5 sm:gap-2 items-center">
          <LanguageSwitcher scrolled={scrolled} />

          {/* Decoration Level Toggle */}
          <button
            onClick={() => {
              const levels: ('none' | 'light' | 'full')[] = ['none', 'light', 'full'];
              const nextIndex = (levels.indexOf(level) + 1) % levels.length;
              setLevel(levels[nextIndex]);
            }}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 relative overflow-hidden group ${
              scrolled
                ? 'hover:bg-primary/10'
                : 'hover:bg-white/10 text-white'
            }`}
            title={`装饰等级: ${level === 'none' ? '关闭' : level === 'light' ? '简约' : '全开'}`}
          >
            <span className="relative z-10 text-lg">
              {level === 'none' ? '🍃' : level === 'light' ? '🌸' : '✨'}
            </span>
            <span className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100"></span>
          </button>

          {mounted && (
          <button
            onClick={toggleTheme}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 relative overflow-hidden group ${
              scrolled
                ? 'hover:bg-primary/10'
                : 'hover:bg-white/10 text-white'
            }`}
            aria-label="Toggle theme"
          >
            <span className="relative z-10 text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100"></span>
          </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden min-h-[44px] min-w-[44px] p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 ${
              scrolled
                ? 'hover:bg-primary/10'
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
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} navItems={navItems} />
    </header>
  );
}
