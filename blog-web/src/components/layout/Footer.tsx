'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-foreground/60">
        <p>© {new Date().getFullYear()} Swater Blog. All rights reserved.</p>
      </div>
    </footer>
  );
}

