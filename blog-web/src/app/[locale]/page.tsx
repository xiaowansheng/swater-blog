import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import ArticleList from '@/components/article/ArticleList';
import HeroSection from '@/components/home/HeroSection';
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
      <HeroSection 
        articleCount={articleList.total || 0}
        tagCount={tags.length}
        categoryCount={categories.length}
      />
      <main id="articles" className="container relative z-10 flex-1 px-4 py-16 mx-auto">
        <div className="flex gap-8">
          <div className="flex-1">
            {articleList.records.length > 0 ? (
              <ArticleList articles={articleList.records} />
            ) : (
              <div className="overflow-hidden relative p-16 text-center modern-card">
                <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
                <div className="relative z-10">
                  <div className="flex justify-center items-center mx-auto mb-6 w-20 h-20 bg-gradient-to-br rounded-2xl from-primary/20 to-accent/20">
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="mb-2 text-xl font-semibold text-foreground/70">{t('noData')}</p>
                  <p className="text-sm text-muted">
                    {process.env.NODE_ENV === 'development' && 'API服务器未连接，请确保后端服务正在运行'}
                  </p>
                </div>
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

