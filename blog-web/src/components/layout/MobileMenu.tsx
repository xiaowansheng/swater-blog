'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const t = useTranslations('nav');

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
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-end p-4">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="w-full max-w-[280px] h-screen transform overflow-hidden rounded-l-3xl bg-background/95 backdrop-blur-xl border-l border-primary/10 shadow-2xl transition-all flex flex-col">
                <div className="p-6 pb-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold font-title text-primary">菜单</h2>
                  <button
                    onClick={onClose}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-primary/10 text-primary active:bg-primary/20 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
                  {[
                    { href: '/', label: t('home') },
                    { href: '/post', label: t('posts') },
                    { href: '/archive', label: t('archives') },
                    { href: '/moment', label: t('moments') },
                    { href: '/friend-link', label: t('friendLinks') },
                    { href: '/about', label: t('about') },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="min-h-[48px] px-5 rounded-2xl hover:bg-primary/5 active:bg-primary/10 transition-all text-base font-bold font-title text-foreground/80 hover:text-primary flex items-center gap-3 group"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary transition-colors"></span>
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="p-8 border-t border-primary/5 text-center">
                  <p className="text-xs text-muted-foreground/50 font-medium tracking-widest uppercase">swater-blog</p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

