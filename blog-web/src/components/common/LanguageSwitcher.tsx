'use client';

import { usePathname } from '@/lib/i18n/routing';
import { useRouter } from '@/lib/i18n/routing';

const locales = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
];

interface LanguageSwitcherProps {
  scrolled?: boolean;
}

export default function LanguageSwitcher({ scrolled = true }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <select
      onChange={(e) => handleChange(e.target.value)}
      className={`px-3 py-1.5 border rounded-lg backdrop-blur-sm text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer ${
        scrolled 
          ? 'bg-background/80 text-foreground border-border hover:bg-background' 
          : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
      }`}
      style={!scrolled ? {
        color: 'white'
      } : {}}
    >
      {locales.map((locale) => (
        <option 
          key={locale.code} 
          value={locale.code}
          style={!scrolled ? {
            backgroundColor: 'rgba(100, 100, 100, 0)',
            color: 'black'
          } : {}}
        >
          {locale.name}
        </option>
      ))}
    </select>
  );
}

