import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, id } = await params;
  const { page = '1' } = await searchParams;
  const t = await getTranslations('common');

  try {
    const tagId = parseInt(id, 10);
    const tag = await tagApi.getById(tagId);
    const currentPage = parseInt(page, 10) || 1;
    const articleList = await articleApi.getList({
      page: currentPage,
      size: 10,
      tagId,
    });

    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="mb-10">
            <h1 className="text-5xl font-bold mb-4 gradient-text">{tag.name}</h1>
            {tag.description && (
              <p className="text-muted text-lg">{tag.description}</p>
            )}
          </div>
          <ArticleList articles={articleList.records} />
          <Pagination
            current={articleList.current}
            total={articleList.pages}
            basePath={`/tag/${id}`}
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
        <main className="container mx-auto px-4 py-8 flex-1">
          <p>{t('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

