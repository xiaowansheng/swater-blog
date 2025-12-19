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
        <main className="container mx-auto px-4 py-8 flex-1">
          <h1 className="text-4xl font-bold mb-8">{t('results')}</h1>
          <p>{t('noResults')}</p>
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
        <main className="container mx-auto px-4 py-8 flex-1">
          <h1 className="text-4xl font-bold mb-8">
            {t('results')}: {keyword}
          </h1>
          <div className="space-y-4">
            {results.records.map((result) => (
              <div key={result.id} className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-2">{result.title}</h2>
                <p className="text-foreground/70 mb-2">{result.content}</p>
                <a
                  href={result.url}
                  className="text-primary hover:underline"
                >
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
        <main className="container mx-auto px-4 py-8 flex-1">
          <p>{t('noResults')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

