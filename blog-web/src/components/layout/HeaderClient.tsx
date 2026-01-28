'use client';

import { Link, useRouter, usePathname } from '@/lib/i18n/routing';
import { useTheme } from '@/lib/utils/theme';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import MobileMenu from './MobileMenu';
import { useDecoration } from '@/lib/context/DecorationContext';
import MusicPlayerButton from '../decoration/MusicPlayerButton';
import SearchModal from '../search/SearchModal';

interface NavItem {
  href: string;
  label: string;
}

interface HeaderClientProps {
  siteName: string;
  navItems: NavItem[];
}

export default function HeaderClient({ siteName, navItems }: HeaderClientProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const { level, setLevel } = useDecoration();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathName = usePathname();
  const isHomePage = pathName === '/' || pathName === '/zh' || pathName === '/en';

  // 快捷键打开搜索
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 只在未聚焦输入框时响应
      if (
        (e.key === '/' || (e.ctrlKey && e.key === 'k')) &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        )
      ) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 语言切换配置
  const locales = [
    { code: 'zh', name: '中文', icon: '🇨🇳' },
    { code: 'en', name: 'English', icon: '🇺🇸' },
  ];

  const handleLanguageChange = () => {
    const currentIndex = locales.findIndex(l => l.code === locale);
    const nextIndex = (currentIndex + 1) % locales.length;
    router.replace(pathname, { locale: locales[nextIndex].code as 'zh' | 'en' });
  };

  const currentLocale = locales.find(l => l.code === locale);

  // 获取下一个语言的信息
  const currentLocaleIndex = locales.findIndex(l => l.code === locale);
  const nextLocale = locales[(currentLocaleIndex + 1) % locales.length];

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
      <div className="container flex relative z-10 justify-between items-center px-4 sm:px-6 mx-auto h-16 max-w-7xl">
        <Link href="/" className={`flex items-center gap-2 text-lg sm:text-xl font-bold transition-all hover:scale-105 relative group font-title ${
          scrolled ? 'text-foreground' : 'text-white drop-shadow-lg'
        }`}>
          <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary flex-shrink-0 ${
            scrolled ? 'animate-pulse' : 'bg-white'}`}></span>
          <span className="tracking-tight leading-tight">{siteName}</span>
        </Link>

        <nav className="hidden gap-1.5 lg:gap-2 items-center md:flex">
          {navItems.map((item) => {
            const isActive = pathName === item.href || pathName === `/${pathName.split('/')[1]}${item.href}`;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 lg:px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative group whitespace-nowrap ${
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

        <div className="flex gap-1 sm:gap-1.5 items-center">
          {/* Search Button - 中等屏幕及以上显示 */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className={`hidden md:block min-h-[40px] lg:min-h-[44px] min-w-[40px] lg:min-w-[44px] p-2 lg:p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 relative overflow-hidden group ${
              scrolled
                ? 'hover:bg-primary/10'
                : 'hover:bg-white/10 text-white'
            }`}
            title="搜索 (按 / 或 Ctrl+K)"
          >
            <svg className="relative z-10 w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100"></span>
          </button>

          {/* Language Switcher Button - 中等屏幕及以上显示 */}
          <button
            onClick={handleLanguageChange}
            className={`hidden md:flex min-h-[40px] lg:min-h-[44px] items-center justify-center gap-1 lg:gap-1.5 px-2 lg:px-2.5 rounded-full transition-all hover:scale-110 active:scale-95 relative overflow-hidden group ${
              scrolled
                ? 'hover:bg-primary/10'
                : 'hover:bg-white/10 text-white'
            }`}
            title={`切换语言: ${currentLocale?.name} → ${nextLocale?.name}`}
          >
            <svg className="relative z-10 w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100"></span>
          </button>

          {/* Music Player Toggle */}
          <MusicPlayerButton scrolled={scrolled} />

          {/* Decoration Level Toggle - 大屏幕显示 */}
          <button
            onClick={() => {
              const levels: ('none' | 'light' | 'full')[] = ['none', 'light', 'full'];
              const nextIndex = (levels.indexOf(level) + 1) % levels.length;
              setLevel(levels[nextIndex]);
            }}
            className={`hidden lg:flex min-h-[40px] lg:min-h-[44px] items-center justify-center gap-1 lg:gap-1.5 px-2 lg:px-3 rounded-full transition-all hover:scale-110 active:scale-95 relative overflow-hidden group text-xs lg:text-sm ${
              scrolled
                ? 'hover:bg-primary/10'
                : 'hover:bg-white/10 text-white'
            }`}
            title={`${t('effects')}: ${level === 'none' ? t('effectOff') : level === 'light' ? t('effectLight') : t('effectFull')}`}
          >
            <span className="relative z-10 text-base lg:text-base">
              {level === 'none' ? '🍃' : level === 'light' ? '🌸' : '✨'}
            </span>
            <span className="relative z-10 font-medium hidden xl:inline">
              {level === 'none' ? t('effectOff') : level === 'light' ? t('effectLight') : t('effectFull')}
            </span>
            <span className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100"></span>
          </button>



          {mounted && (
          <button
            onClick={toggleTheme}
            className={`min-h-[40px] lg:min-h-[44px] min-w-[40px] lg:min-w-[44px] p-2 lg:p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 relative overflow-hidden group ${
              scrolled
                ? 'hover:bg-primary/10'
                : 'hover:bg-white/10 text-white'
            }`}
            aria-label="Toggle theme"
          >
            <span className="relative z-10 text-base lg:text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100"></span>
          </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden min-h-[40px] lg:min-h-[44px] min-w-[40px] lg:min-w-[44px] p-2 lg:p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 ${
              scrolled
                ? 'hover:bg-primary/10'
                : 'hover:bg-white/10 text-white'
            }`}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
        onOpenSearch={() => setSearchModalOpen(true)}
      />
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </header>
  );
}
