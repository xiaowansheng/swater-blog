import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import ArticleList from '@/components/article/ArticleList';
import { articleApi } from '@/lib/api/article';
import { categoryApi } from '@/lib/api/category';
import { tagApi } from '@/lib/api/tag';
import { ISR_REVALIDATE } from '@/lib/constants';

export const revalidate = ISR_REVALIDATE.HOME;

export default async function HomePage() {
  const t = await getTranslations('common');

  let articleList = { records: [], total: 0, size: 10, current: 1, pages: 0 };
  let hotArticles: any[] = [];
  let categories: any[] = [];
  let tags: any[] = [];

  try {
    articleList = await articleApi.getList({ page: 1, size: 10 });
  } catch (error) {
    console.warn('Failed to load articles (API server may not be running):', error);
  }

  try {
    hotArticles = await articleApi.getHot(5);
  } catch (error) {
    console.warn('Failed to load hot articles:', error);
  }

  try {
    categories = await categoryApi.getList();
  } catch (error) {
    console.warn('Failed to load categories:', error);
  }

  try {
    tags = await tagApi.getList();
  } catch (error) {
    console.warn('Failed to load tags:', error);
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-8">{t('home')}</h1>
            {articleList.records.length > 0 ? (
              <ArticleList articles={articleList.records} />
            ) : (
              <div className="bg-card border rounded-lg p-8 text-center">
                <p className="text-foreground/70 mb-4">{t('noData')}</p>
                <p className="text-sm text-foreground/50">
                  {process.env.NODE_ENV === 'development' && 'API服务器未连接，请确保后端服务正在运行'}
                </p>
              </div>
            )}
          </div>
            <Sidebar categories={categories} tags={tags} hotArticles={hotArticles} />
        </div>
      </main>
      <Footer />
    </>
  );
}

