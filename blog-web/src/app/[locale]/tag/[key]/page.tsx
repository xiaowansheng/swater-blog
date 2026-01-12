import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import ArticleList from '@/components/article/ArticleList';
import Pagination from '@/components/common/Pagination';
import { articleApi } from '@/lib/api/article';
import { tagApi } from '@/lib/api/tag';
import { ISR_REVALIDATE } from '@/lib/constants';
import { getCoverConfig } from '@/lib/api/config.server';

export const revalidate = ISR_REVALIDATE.TAG;

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; key: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, key } = await params;
  const { page = '1' } = await searchParams;
  const t = await getTranslations('common');

  try {
    const tag = await tagApi.getByKey(key);
    const currentPage = parseInt(page, 10) || 1;
    const [articleList, cover] = await Promise.all([
      articleApi.getList({
        page: currentPage,
        size: 10,
        tagId: tag.id,
      }),
      getCoverConfig()
    ]);

    return (
      <>
        <PageHeader title={tag.name} coverImage={cover.tag} />
        <main className="container flex-1 px-4 py-12 mx-auto">
          {articleList.records.length > 0 ? (
            <>
              <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('totalArticles')}: {articleList.total}
                </span>
              </div>
              <ArticleList articles={articleList.records} />
              <Pagination
                current={articleList.current}
                total={articleList.pages}
                basePath={`/tag/${key}`}
              />
            </>
          ) : (
            <div className="overflow-hidden relative p-8 sm:p-12 md:p-16 text-center modern-card">
              <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
              <div className="relative z-10">
                <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br rounded-2xl from-primary/20 to-accent/20">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{t('noArticlesInTag')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{t('noArticlesHint')}</p>
              </div>
            </div>
          )}
        </main>
        
      </>
    );
  } catch (error) {
    console.error('Failed to load tag:', error);
    const cover = await getCoverConfig();
    return (
      <>
        <PageHeader title={t('tags')} coverImage={cover.tag} />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
        
      </>
    );
  }
}

