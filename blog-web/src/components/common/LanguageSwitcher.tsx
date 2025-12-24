'use client';

import { usePathname } from '@/lib/i18n/routing';
import { useRouter } from '@/lib/i18n/routing';
import { useTheme } from '@/lib/utils/theme';

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
  const { theme, mounted } = useTheme();

  const handleChange = (locale: string) => {
    router.replace(pathname, { locale });
  };

  const getOptionStyle = () => {
    if (!scrolled && mounted) {
      if (theme === 'dark') {
        return {
          backgroundColor: 'rgba(50, 50, 50, 0.95)',
          color: 'white'
        };
      } else {
        return {
          backgroundColor: 'rgba(240, 240, 240, 0.95)',
          color: 'black'
        };
      }
    }
    return {};
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
          style={getOptionStyle()}
        >
          {locale.name}
        </option>
      ))}
    </select>
  );
}

