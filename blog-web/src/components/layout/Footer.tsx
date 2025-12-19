'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="border-t border-border/40 py-12 mt-auto bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Swater Blog. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted">
            <a href="/about" className="hover:text-primary transition-colors">关于</a>
            <a href="/friend-link" className="hover:text-primary transition-colors">友链</a>
            <a href="/guestbook" className="hover:text-primary transition-colors">留言</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

