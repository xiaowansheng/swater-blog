import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { searchApi } from '@/lib/api/search';

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ keyword?: string; page?: string }>;
}) {
  const { keyword = '', page = '1' } = await searchParams;
  const t = await getTranslations('search');

  if (!keyword) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="mb-10">
            <h1 className="text-5xl font-bold mb-4 gradient-text">{t('results')}</h1>
          </div>
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
            <svg className="w-16 h-16 mx-auto mb-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-foreground/70 text-lg">{t('noResults')}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  try {
    const currentPage = parseInt(page, 10) || 1;
    const results = await searchApi.search({
      keyword,
      page: currentPage,
      size: 10,
    });

    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="mb-10">
            <h1 className="text-5xl font-bold mb-4 gradient-text">
              {t('results')}: <span className="text-primary">{keyword}</span>
            </h1>
            <p className="text-muted text-lg">找到 {results.total} 条结果</p>
          </div>
          <div className="space-y-6">
            {results.records.map((result) => (
              <div key={result.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <h2 className="text-xl font-bold mb-3 hover:text-primary transition-colors">
                  <a href={result.url}>{result.title}</a>
                </h2>
                <p className="text-foreground/70 mb-3 line-clamp-2">{result.content}</p>
                <a
                  href={result.url}
                  className="text-primary hover:underline text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {result.url}
                </a>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to search:', error);
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
            <svg className="w-16 h-16 mx-auto mb-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-foreground/70 text-lg">{t('noResults')}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }
}

