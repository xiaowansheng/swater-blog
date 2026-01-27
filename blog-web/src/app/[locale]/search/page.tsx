import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import { searchApi } from '@/lib/api/search';
import { Card } from '@/components/ui/Card';
import { ISR_REVALIDATE, PAGINATION_DEFAULT_SIZE } from '@/lib/constants';
import type { PageResult, SearchVO } from '@/types';

export const revalidate = ISR_REVALIDATE.SEARCH;

const EMPTY_RESULTS: PageResult<SearchVO> = {
  records: [],
  total: 0,
  size: PAGINATION_DEFAULT_SIZE,
  current: 1,
  pages: 0,
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string; page?: string }>;
}) {
  const { keyword = '', page = '1' } = await searchParams;
  const t = await getTranslations('search');
  const tCommon = await getTranslations('common');

  if (!keyword) {
    return (
      <>
        <PageHeader title={t('results')} description={tCommon('search')} />
        <main className="container flex-1 px-4 py-12 mx-auto">
          <Card className="overflow-hidden relative p-8 sm:p-12 md:p-16 text-center" hoverEffect={false}>
            <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br rounded-2xl from-primary/20 to-accent/20">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{t('noSearchKeyword')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{tCommon('noData')}</p>
            </div>
          </Card>
        </main>
      </>
    );
  }

  const currentPage = parseInt(page, 10) || 1;
  let results: PageResult<SearchVO> = EMPTY_RESULTS;
  let hasError = false;
  try {
    results = await searchApi.search({
      keyword,
      page: currentPage,
      size: PAGINATION_DEFAULT_SIZE,
    });
  } catch (error) {
    console.error('Search failed:', error);
    hasError = true;
  }

  if (hasError) {
    return (
      <>
        <PageHeader title={`${t('results')}: ${keyword}`} description={tCommon('noData')} />
        <main className="container flex-1 px-4 py-12 mx-auto">
          <p>{tCommon('noData')}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader title={`${t('results')}: ${keyword}`} description={`找到 ${results.total} 条结果`} />
      <main className="container flex-1 px-4 py-12 mx-auto">
        {results.records.length > 0 ? (
          <div className="space-y-6">
            {results.records.map((result, index) => {
              const url =
                result.type === 'post'
                  ? `/post/${result.articleKey || result.id}`
                  : result.type === 'moment'
                    ? `/moment/${result.id}`
                    : result.url || '#';

              return (
                <Card
                  key={result.id}
                  className="p-6 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <h2 className="mb-3 text-xl font-bold transition-colors hover:text-primary">
                    <a href={url}>{result.title}</a>
                  </h2>
                  <p className="mb-3 text-foreground/70 line-clamp-2">{result.content}</p>
                  <a href={url} className="flex gap-1 items-center text-sm text-primary hover:underline">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    查看详情
                  </a>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="overflow-hidden relative p-8 sm:p-12 md:p-16 text-center" hoverEffect={false}>
            <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br rounded-2xl from-primary/20 to-accent/20">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h.01M12 12h.01M15 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{t('noResults')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{tCommon('noData')}</p>
            </div>
          </Card>
        )}
      </main>
    </>
  );
}
