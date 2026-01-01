import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/layout/PageHeader';
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
  const tCommon = await getTranslations('common');

  if (!keyword) {
    return (
      <>
        <Header />
        <PageHeader title={t('results')} description={tCommon('search')} />
        <main className="container flex-1 px-4 py-12 mx-auto">
          <div className="p-12 text-center rounded-xl border shadow-sm bg-card border-border">
            <svg className="mx-auto mb-4 w-16 h-16 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg text-foreground/70">{t('noResults')}</p>
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
        <PageHeader title={`${t('results')}: ${keyword}`} description={`找到 ${results.total} 条结果`} />
        <main className="container flex-1 px-4 py-12 mx-auto">
          <div className="space-y-6">
            {results.records.map((result) => {
              const url = result.type === 'post' 
                ? `/post/${result.articleKey || result.id}` 
                : result.type === 'moment'
                ? `/moment/${result.id}`
                : result.url || '#';

              return (
                <div key={result.id} className="p-6 rounded-xl border transition-all duration-300 bg-card border-border hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                  <h2 className="mb-3 text-xl font-bold transition-colors hover:text-primary">
                    <a href={url}>{result.title}</a>
                  </h2>
                  <p className="mb-3 text-foreground/70 line-clamp-2">{result.content}</p>
                  <a
                    href={url}
                    className="flex gap-1 items-center text-sm text-primary hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {url}
                  </a>
                </div>
              );
            })}
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
        <PageHeader title={t('results')} description={tCommon('search')} />
        <main className="container flex-1 px-4 py-12 mx-auto">
          <div className="p-12 text-center rounded-xl border shadow-sm bg-card border-border">
            <svg className="mx-auto mb-4 w-16 h-16 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg text-foreground/70">{t('noResults')}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }
}

