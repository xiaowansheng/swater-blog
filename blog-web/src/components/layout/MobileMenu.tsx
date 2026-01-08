'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link } from '@/lib/i18n/routing';

interface NavItem {
  href: string;
  label: string;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export default function MobileMenu({ open, onClose, navItems }: MobileMenuProps) {
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
              <Dialog.Panel className="w-full min-h-[40vh] max-h-[70vh] transform overflow-hidden rounded-b-3xl bg-background/95 backdrop-blur-xl border-b border-x border-primary/10 shadow-2xl transition-all flex flex-col">
                {/* 固定顶部 */}
                <div className="flex-shrink-0 p-5 pb-4 flex justify-between items-center border-b border-primary/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <h2 className="text-lg font-bold font-title text-primary">导航菜单</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-primary/10 text-primary active:bg-primary/20 transition-colors hover:scale-105 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 可滚动内容区 */}
                <nav className="flex-1 overflow-y-auto px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="min-h-[48px] px-4 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-all text-base font-bold font-title text-foreground/80 hover:text-primary flex items-center gap-3 group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary group-hover:scale-125 transition-all"></span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </nav>

                {/* 固定底部 */}
                <div className="flex-shrink-0 p-4 pt-3 border-t border-primary/10">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
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

