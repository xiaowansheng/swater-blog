import { getTranslations } from 'next-intl/server';
import Sidebar from '@/components/layout/Sidebar';
import ArticleList from '@/components/article/ArticleList';
import HeroSection from '@/components/home/HeroSection';
import Pagination from '@/components/common/Pagination';
import { articleApi } from '@/lib/api/article';
import { categoryApi } from '@/lib/api/category';
import { tagApi } from '@/lib/api/tag';
import { PAGINATION_DEFAULT_SIZE } from '@/lib/constants';
import type { PageResult, PostVO, CategoryVO, TagVO } from '@/types';

export const revalidate = 300;

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
  let hasArticleError = false;

  try {
    articleList = await articleApi.getList({ page: currentPage, size: PAGINATION_DEFAULT_SIZE });
  } catch (error) {
    console.warn('Failed to load articles (API server may not be running):', error);
    hasArticleError = true;
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
                <Pagination
                  current={articleList.current}
                  total={articleList.pages}
                  totalCount={articleList.total}
                  basePath="/"
                  pageSize={articleList.size}
                  scrollToId="article-list"
                />
              </>
            ) : (
              <div className="overflow-hidden relative p-8 sm:p-12 md:p-16 text-center modern-card">
                {hasArticleError ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br via-transparent from-red-500/10 to-orange-500/10"></div>
                    <div className="relative z-10">
                      <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br rounded-2xl from-red-500/20 to-orange-500/20">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{t('error')}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">{t('apiNotConnected')}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
                    <div className="relative z-10">
                      <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br rounded-2xl from-primary/20 to-accent/20">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{t('noArticles')}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">{t('noArticlesHint')}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <Sidebar categories={categories} tags={tags} hotArticles={hotArticles} />
        </div>
      </main>
    </>
  );
}

