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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-l-2xl bg-card border-l border-border p-6 shadow-2xl transition-all">
                <div className="mb-6 pb-4 border-b border-border">
                  <h2 className="text-xl font-bold gradient-text">菜单</h2>
                </div>
                <nav className="flex flex-col gap-2">
                  <Link
                    href="/"
                    onClick={onClose}
                    className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-lg font-medium"
                  >
                    {t('home')}
                  </Link>
                  <Link
                    href="/post"
                    onClick={onClose}
                    className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-lg font-medium"
                  >
                    {t('posts')}
                  </Link>
                  <Link
                    href="/category"
                    onClick={onClose}
                    className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-lg font-medium"
                  >
                    {t('categories')}
                  </Link>
                  <Link
                    href="/tag"
                    onClick={onClose}
                    className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-lg font-medium"
                  >
                    {t('tags')}
                  </Link>
                  <Link
                    href="/archive"
                    onClick={onClose}
                    className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-lg font-medium"
                  >
                    {t('archives')}
                  </Link>
                  <Link
                    href="/about"
                    onClick={onClose}
                    className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-lg font-medium"
                  >
                    {t('about')}
                  </Link>
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

