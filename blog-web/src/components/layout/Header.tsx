'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { useTheme } from '@/lib/utils/theme';
import { useState } from 'react';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const { theme, toggleTheme, mounted } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b border-border/20 shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold gradient-text transition-all hover:scale-105 relative group">
          <span className="relative z-10">Swater Blog</span>
          <span className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 bg-gradient-to-r from-primary to-accent transition-opacity"></span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link href="/" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-all relative group rounded-lg hover:bg-primary/5">
            {t('home')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
          </Link>
          <Link href="/post" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-all relative group rounded-lg hover:bg-primary/5">
            {t('posts')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
          </Link>
          <Link href="/category" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-all relative group rounded-lg hover:bg-primary/5">
            {t('categories')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
          </Link>
          <Link href="/tag" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-all relative group rounded-lg hover:bg-primary/5">
            {t('tags')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
          </Link>
          <Link href="/archive" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-all relative group rounded-lg hover:bg-primary/5">
            {t('archives')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
          </Link>
          <Link href="/about" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-all relative group rounded-lg hover:bg-primary/5">
            {t('about')}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-3/4 rounded-full"></span>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-secondary/50 transition-all hover:scale-110 active:scale-95 relative overflow-hidden group"
              aria-label="Toggle theme"
            >
              <span className="relative z-10 text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-secondary/50 transition-all hover:scale-110 active:scale-95"
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

