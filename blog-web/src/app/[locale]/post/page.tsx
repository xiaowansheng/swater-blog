import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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
  const t = await getTranslations('common');

  try {
    const currentPage = parseInt(page, 10) || 1;
    const articleList = await articleApi.getList({ page: currentPage, size: 10 });

    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="mb-10">
            <h1 className="text-5xl font-bold mb-4 gradient-text">{t('article.list')}</h1>
            <p className="text-muted text-lg">所有文章</p>
          </div>
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
        <main className="container mx-auto px-4 py-8 flex-1">
          <p>{t('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

