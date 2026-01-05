import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/layout/PageHeader';
import ArticleList from '@/components/article/ArticleList';
import Pagination from '@/components/common/Pagination';
import { articleApi } from '@/lib/api/article';
import { tagApi } from '@/lib/api/tag';
import { ISR_REVALIDATE } from '@/lib/constants';

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
    const articleList = await articleApi.getList({
      page: currentPage,
      size: 10,
      tagId: tag.id,
    });

    return (
      <>
        <Header />
        <PageHeader title={tag.name} description={tag.description || undefined} />
        <main className="container flex-1 px-4 py-12 mx-auto">
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
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load tag:', error);
    return (
      <>
        <Header />
        <PageHeader title={t('tags')} />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

