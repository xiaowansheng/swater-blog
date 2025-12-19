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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          Swater Blog
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-foreground/80">
            {t('home')}
          </Link>
          <Link href="/post" className="hover:text-foreground/80">
            {t('posts')}
          </Link>
          <Link href="/category" className="hover:text-foreground/80">
            {t('categories')}
          </Link>
          <Link href="/tag" className="hover:text-foreground/80">
            {t('tags')}
          </Link>
          <Link href="/archive" className="hover:text-foreground/80">
            {t('archives')}
          </Link>
          <Link href="/about" className="hover:text-foreground/80">
            {t('about')}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-foreground/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}

