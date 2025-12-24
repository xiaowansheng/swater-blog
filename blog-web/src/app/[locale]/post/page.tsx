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
          <ArticleList articles={articleList.records} />
          <Pagination
            current={articleList.current}
            total={articleList.pages}
            basePath="/post"
          />
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

