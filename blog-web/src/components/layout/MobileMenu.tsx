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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-lg bg-background p-6 shadow-xl transition-all">
                <nav className="flex flex-col gap-4">
                  <Link href="/" onClick={onClose} className="text-lg">
                    {t('home')}
                  </Link>
                  <Link href="/post" onClick={onClose} className="text-lg">
                    {t('posts')}
                  </Link>
                  <Link href="/category" onClick={onClose} className="text-lg">
                    {t('categories')}
                  </Link>
                  <Link href="/tag" onClick={onClose} className="text-lg">
                    {t('tags')}
                  </Link>
                  <Link href="/archive" onClick={onClose} className="text-lg">
                    {t('archives')}
                  </Link>
                  <Link href="/about" onClick={onClose} className="text-lg">
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

