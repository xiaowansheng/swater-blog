'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';

export default function SearchBox() {
  const t = useTranslations('search');
  const router = useRouter();
  const [keyword, setKeyword] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={t('placeholder')}
        className="px-4 py-2 border rounded-lg bg-background"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
      >
        {t('results')}
      </button>
    </form>
  );
}

