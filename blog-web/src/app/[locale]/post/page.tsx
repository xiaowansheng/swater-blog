import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/layout/PageHeader';
import ArticleList from '@/components/article/ArticleList';
import Pagination from '@/components/common/Pagination';
import { articleApi } from '@/lib/api/article';
import { ISR_REVALIDATE } from '@/lib/constants';

export const revalidate = ISR_REVALIDATE.HOME;

export default async function PostListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page = '1' } = await searchParams;
  const t = await getTranslations('article');
  const tCommon = await getTranslations('common');

  try {
    const currentPage = parseInt(page, 10) || 1;
    const articleList = await articleApi.getList({ page: currentPage, size: 10 });

    return (
      <>
        <Header />
        <PageHeader title={t('list')} description="所有文章" />
        <main className="container flex-1 px-4 py-12 mx-auto">
          {articleList.records.length > 0 ? (
            <>
              <ArticleList articles={articleList.records} />
              <Pagination
                current={articleList.current}
                total={articleList.pages}
                basePath="/post"
              />
            </>
          ) : (
            <div className="overflow-hidden relative p-8 sm:p-12 md:p-16 text-center modern-card">
              <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
              <div className="relative z-10">
                <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br rounded-2xl from-primary/20 to-accent/20">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{tCommon('noArticles')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{tCommon('noArticlesHint')}</p>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load articles:', error);
    return (
      <>
        <Header />
        <PageHeader title={t('list')} description="所有文章" />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{tCommon('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

