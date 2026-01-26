import { getSiteInfo } from '@/lib/api/config.server';
import { getTotalVisits } from '@/lib/api/statistics';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import SiteRunningTime from './SiteRunningTime';

export default async function Footer() {
  const site = await getSiteInfo();
  const visits = await getTotalVisits();
  const t = await getTranslations('common');

  const defaultCopyright = `© ${new Date().getFullYear()} ${site.name || 'Blog'}. All rights reserved.`;

  return (
    <footer className="relative mt-auto overflow-hidden py-16 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-t border-white/20 dark:border-white/5">
      {/* Cute Wavy Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180 opacity-50">
         <svg className="relative block w-[calc(100%+1.3px)] h-12 text-primary/10 fill-current" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
           <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
         </svg>
      </div>
      
      {/* Centered Decoration */}
      <div className="absolute top-0 left-0 w-full h-8 flex items-center justify-center pointer-events-none z-10">
        <div className="flex gap-3 items-center px-6 py-1 bg-background/50 backdrop-blur-sm rounded-full border border-primary/10">
          <span className="w-1.5 h-1.5 rounded-full bg-deco-pink animate-pulse"></span>
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-deco-yellow animate-pulse" style={{ animationDelay: '0.5s' }}></span>
        </div>
      </div>

      <div className="container relative z-10 px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
          {/* Copyright Info */}
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <span className="text-xl font-bold font-title text-primary tracking-tight">{site.name}</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary font-medium uppercase tracking-wider whitespace-nowrap">Fresh & Healing</span>
            </div>
            <p className="text-sm text-muted-foreground/80 font-medium">
              {site.copyright || defaultCopyright}
            </p>
            {(site.icp || site.police) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/60 justify-center md:justify-start">
                {site.icp && <span className="hover:text-primary transition-colors cursor-default">{site.icp}</span>}
                {site.police && <span className="hover:text-primary transition-colors cursor-default">{site.police}</span>}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex flex-col justify-center gap-4 sm:gap-6 items-center order-first md:order-none">
            <div className="flex gap-6 sm:gap-8 items-center flex-wrap justify-center">
              <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-all hover:scale-110 relative group">
                {t('about')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full"></span>
              </Link>
              <Link href="/friend-link" className="text-sm font-medium text-muted-foreground hover:text-primary transition-all hover:scale-110 relative group">
                {t('friendLinks')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full"></span>
              </Link>
              <Link href="/guestbook" className="text-sm font-medium text-muted-foreground hover:text-primary transition-all hover:scale-110 relative group">
                {t('guestbook')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full"></span>
              </Link>
            </div>

            {/* Visit Statistics */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground/70 flex-wrap justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-deco-pink animate-pulse"></span>
                <span className="font-medium">{t('totalVisits')}</span>
                <span className="font-bold text-primary" title="Page Views">
                  {visits.pv.toLocaleString()}
                </span>
              </div>
              <span className="w-px h-3 bg-border hidden sm:block"></span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-deco-yellow animate-pulse" style={{ animationDelay: '0.5s' }}></span>
                <span className="font-medium">{t('visitors')}</span>
                <span className="font-bold text-primary" title="Unique Visitors">
                  {visits.uv.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Site Running Time */}
            {site.createTime && (
              <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground/70 flex-wrap justify-center">
                <SiteRunningTime createTime={site.createTime} />
              </div>
            )}
          </div>

          {/* Tech Stack / Extra Info */}
          <div className="text-center md:text-right">
            <div className="inline-flex flex-col items-center md:items-end gap-1">
              <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">{t('poweredBy')}</p>
              <div className="flex gap-3 items-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <span className="text-sm font-semibold text-foreground/70">Next.js</span>
                <span className="w-1 h-1 rounded-full bg-border"></span>
                <span className="text-sm font-semibold text-foreground/70">Tailwind</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decorative Gradients */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-deco-pink/5 rounded-full blur-3xl pointer-events-none"></div>
    </footer>
  );
}
