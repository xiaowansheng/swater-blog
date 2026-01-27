import { getTranslations } from 'next-intl/server';
import Sidebar from '@/components/layout/Sidebar';
import ArticleList from '@/components/article/ArticleList';
import HeroSection from '@/components/home/HeroSection';
import Pagination from '@/components/common/Pagination';
import { articleApi } from '@/lib/api/article';
import { categoryApi } from '@/lib/api/category';
import { tagApi } from '@/lib/api/tag';
import { ISR_REVALIDATE, PAGINATION_DEFAULT_SIZE } from '@/lib/constants';
import type { PageResult, PostVO, CategoryVO, TagVO } from '@/types';

export const revalidate = ISR_REVALIDATE.HOME;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations('common');
  const { page = '1' } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;

  let articleList: PageResult<PostVO> = { records: [], total: 0, size: PAGINATION_DEFAULT_SIZE, current: 1, pages: 0 };
  let hotArticles: PostVO[] = [];
  let categories: CategoryVO[] = [];
  let tags: TagVO[] = [];

  try {
    articleList = await articleApi.getList({ page: currentPage, size: PAGINATION_DEFAULT_SIZE });
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
      <HeroSection
        articleCount={articleList.total || 0}
        tagCount={tags.length}
        categoryCount={categories.length}
      />
      <main id="articles" className="container relative z-10 flex-1 px-3 sm:px-4 py-8 sm:py-12 md:py-16 mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 w-full" id="article-list">
            {articleList.records.length > 0 ? (
              <>
                <ArticleList articles={articleList.records} />
                {/* 分页组件 */}
                {articleList.pages > 1 && (
                  <Pagination
                    current={articleList.current}
                    total={articleList.pages}
                    totalCount={articleList.total}
                    basePath="/"
                    pageSize={articleList.size}
                    scrollToId="article-list"
                  />
                )}
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
                  <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{t('noArticles')}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2">{t('noArticlesHint')}</p>
                  {process.env.NODE_ENV === 'development' && (
                    <p className="mt-4 text-xs sm:text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-2 rounded-lg inline-block">
                      {t('apiNotConnected')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <Sidebar categories={categories} tags={tags} hotArticles={hotArticles} />
        </div>
      </main>
    </>
  );
}

