'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link, useRouter, usePathname } from '@/lib/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { useDecoration } from '@/lib/context/DecorationContext';

interface NavItem {
  href: string;
  label: string;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  onOpenSearch?: () => void;
}

export default function MobileMenu({ open, onClose, navItems, onOpenSearch }: MobileMenuProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { level, setLevel } = useDecoration();

  const levels: ('none' | 'light' | 'full')[] = ['none', 'light', 'full'];
  const levelLabels = {
    none: '🍃',
    light: '🌸',
    full: '✨'
  };

  const locales = [
    { code: 'zh', name: '中文', icon: '🇨🇳' },
    { code: 'en', name: 'English', icon: '🇺🇸' },
  ];

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale as 'zh' | 'en' });
  };
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 md:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="flex min-h-full items-start justify-start">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom="-translate-y-full"
              enterTo="translate-y-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-y-0"
              leaveTo="-translate-y-full"
            >
              <Dialog.Panel className="w-full min-h-[55vh] max-h-[80vh] transform overflow-hidden rounded-b-3xl bg-background/95 backdrop-blur-xl border-b border-x border-primary/10 shadow-2xl transition-all flex flex-col">
                {/* 固定顶部 */}
                <div className="flex-shrink-0 p-6 pb-5 flex justify-between items-center border-b border-primary/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                    <h2 className="text-xl font-bold font-title text-primary">{t('navigationMenu')}</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-primary/10 text-primary active:bg-primary/20 transition-colors hover:scale-105 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 可滚动内容区 */}
                <nav className="flex-1 overflow-y-auto">
                  {/* 工具按钮区 */}
                  <div className="px-5 py-4 border-b border-primary/10">
                    <div className="grid grid-cols-2 gap-3">
                      {/* 搜索按钮 */}
                      <button
                        onClick={() => {
                          onOpenSearch?.();
                          onClose();
                        }}
                        className="min-h-[50px] flex items-center justify-center gap-2 px-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 active:from-primary/15 active:to-accent/15 transition-all border border-primary/10 hover:border-primary/20 text-sm font-medium text-foreground/80 hover:text-primary"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>{t('search')}</span>
                      </button>

                      {/* 装饰等级切换 */}
                      <button
                        onClick={() => {
                          const nextIndex = (levels.indexOf(level) + 1) % levels.length;
                          setLevel(levels[nextIndex]);
                        }}
                        className="min-h-[50px] flex flex-col items-center justify-center gap-0.5 px-3 rounded-xl bg-gradient-to-br from-accent/5 to-primary/5 hover:from-accent/10 hover:to-primary/10 active:from-accent/15 active:to-primary/15 transition-all border border-accent/10 hover:border-accent/20 text-xs font-medium text-foreground/80"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-base">{levelLabels[level]}</span>
                          <span className="text-[10px] text-muted-foreground">{t('effects')}</span>
                        </div>
                        <span className={`text-[10px] font-semibold ${
                          level === 'none' ? 'text-muted-foreground' :
                          level === 'light' ? 'text-accent' :
                          'text-primary'
                        }`}>
                          {level === 'none' ? t('effectOff') : level === 'light' ? t('effectLight') : t('effectFull')}
                        </span>
                      </button>
                    </div>

                    {/* 语言切换 */}
                    <div className="flex gap-2 mt-3">
                      {locales.map((loc) => (
                        <button
                          key={loc.code}
                          onClick={() => handleLanguageChange(loc.code)}
                          className={`flex-1 min-h-[46px] flex items-center justify-center gap-1.5 px-3 rounded-lg transition-all text-xs font-medium ${
                            locale === loc.code
                              ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/20 border border-primary/30'
                              : 'bg-secondary/50 text-foreground/60 hover:bg-secondary hover:text-foreground/80 border border-border/50'
                          }`}
                        >
                          <span className="text-sm">{loc.icon}</span>
                          <span>{loc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 导航链接区 */}
                  <div className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className="min-h-[52px] px-4 py-3.5 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-all text-base font-semibold font-title text-foreground/80 hover:text-primary flex items-center gap-3 group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary group-hover:scale-125 transition-all"></span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>

                {/* 固定底部 */}
                <div className="flex-shrink-0 p-6 pt-5 border-t border-primary/10">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                    <span className="font-medium tracking-wider">SWATER BLOG</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

