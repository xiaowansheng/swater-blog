import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import ArticleList from '@/components/article/ArticleList';
import Pagination from '@/components/common/Pagination';
import { articleApi } from '@/lib/api/article';
import { categoryApi } from '@/lib/api/category';
import { ISR_REVALIDATE } from '@/lib/constants';
import { getCoverConfig } from '@/lib/api/config.server';

export const revalidate = ISR_REVALIDATE.CATEGORY;

export default async function CategoryPage({
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
    const category = await categoryApi.getByKey(key);
    const currentPage = parseInt(page, 10) || 1;
    const [articleList, cover] = await Promise.all([
      articleApi.getList({
        page: currentPage,
        size: 10,
        categoryId: category.id,
      }),
      getCoverConfig()
    ]);

    return (
      <>
        <PageHeader title={category.name} description={category.description || undefined} coverImage={cover.category} />
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
                totalCount={articleList.total}
                basePath={`/category/${key}`}
                pageSize={articleList.size}
              />
            </>
          ) : (
            <div className="overflow-hidden relative p-8 sm:p-12 md:p-16 text-center modern-card">
              <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
              <div className="relative z-10">
                <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br rounded-2xl from-primary/20 to-accent/20">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{t('noArticlesInCategory')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{t('noArticlesHint')}</p>
              </div>
            </div>
          )}
        </main>
        
      </>
    );
  } catch (error) {
    console.error('Failed to load category:', error);
    const cover = await getCoverConfig();
    return (
      <>
        <PageHeader title={t('categories')} coverImage={cover.category} />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
        
      </>
    );
  }
}

