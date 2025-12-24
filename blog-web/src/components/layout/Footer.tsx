'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="border-t border-border/40 py-12 mt-auto bg-card/50 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-6">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
            <p className="text-sm text-muted">
              © {new Date().getFullYear()} Swater Blog. All rights reserved.
            </p>
            <div className="w-1 h-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <div className="flex justify-center gap-8 text-sm">
            <a href="/about" className="text-muted hover:text-primary transition-all hover:scale-110 relative group">
              关于
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform rounded-full"></span>
            </a>
            <a href="/friend-link" className="text-muted hover:text-primary transition-all hover:scale-110 relative group">
              友链
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform rounded-full"></span>
            </a>
            <a href="/guestbook" className="text-muted hover:text-primary transition-all hover:scale-110 relative group">
              留言
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform rounded-full"></span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

