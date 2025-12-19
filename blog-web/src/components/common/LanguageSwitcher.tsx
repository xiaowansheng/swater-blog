'use client';

import { usePathname } from '@/lib/i18n/routing';
import { useRouter } from '@/lib/i18n/routing';
import { routing } from '@/lib/i18n/routing';

const locales = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <select
      onChange={(e) => handleChange(e.target.value)}
      className="px-3 py-1 border rounded bg-background"
    >
      {locales.map((locale) => (
        <option key={locale.code} value={locale.code}>
          {locale.name}
        </option>
      ))}
    </select>
  );
}

