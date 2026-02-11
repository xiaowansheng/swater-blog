import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
// import ArticleMeta from '@/components/article/ArticleMeta';
import ContentLikeButton from '@/components/common/ContentLikeButton';
import ArticleCopyright from '@/components/article/ArticleCopyright';
import ArticleMenu from '@/components/article/ArticleMenu';
import ArticleMenuMobile from '@/components/article/ArticleMenuMobile';
import ReadingProgress from '@/components/widgets/ReadingProgress';
import { AnimeComment } from '@/components/anime-comment';
import ContentTracker from '@/components/visitor/ContentTracker';
import ArticleLiveStats from '@/components/article/ArticleLiveStats';
import { articleApi } from '@/lib/api/article';
import { getAuthorInfo, getCoverConfig, getComponentConfig } from '@/lib/api/config.server';
import { generateArticleMetadata } from '@/lib/utils/seo';
import { formatDate } from '@/lib/utils/format';
import { Card } from '@/components/ui/Card';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const article = await articleApi.getByKey(slug);
    return generateArticleMetadata(article, locale);
  } catch {
    return {
      title: 'Article Not Found',
    };
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('common');

  try {
    const [article, author, cover, componentConfig] = await Promise.all([
      articleApi.getByKey(slug),
      getAuthorInfo(),
      getCoverConfig(),
      getComponentConfig()
    ]);

    return (
      <>
        <ContentTracker contentType="ARTICLE" contentId={article.id} />
        <ReadingProgress />
        {/* 文章头部 */}
        <PageHeader coverImage={cover.article}>
          {/* 文章标题 */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text leading-tight line-clamp-3" title={article.title}>
            {article.title}
          </h1>

          {/* 文章时间信息 */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-sm">
            {/* 创建时间 */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-200">
                {t('publishedAt')} {formatDate(article.createTime, 'YYYY-MM-DD HH:mm:ss', locale)}
              </span>
            </div>

            {/* 更新时间 */}
            {article.updateTime && article.updateTime !== article.createTime && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-gray-700 dark:text-gray-200">
                  {t('updatedAt')} {formatDate(article.updateTime, 'YYYY-MM-DD HH:mm:ss', locale)}
                </span>
              </div>
            )}
          </div>
        </PageHeader>

        <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 flex-1">
          <div className="min-w-0 lg:flex lg:gap-8">
            {/* 主要内容 */}
            <article className="min-w-0 flex-1">
              <Card hoverEffect={false} className="w-full overflow-x-hidden rounded-2xl shadow-sm border border-border bg-card">
                <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-12">
                  {/* 分类和标签 */}
                  <div className="flex flex-wrap items-center gap-3 mb-8">
                    {/* 分类 - 更突出的样式 */}
                    {article.categoryName && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-base font-semibold text-white">{article.categoryName}</span>
                      </div>
                    )}

                    {/* 标签 - 简洁的样式 */}
                    {article.tags && article.tags.length > 0 && (
                      <>
                        {article.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-primary/60 hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-all shadow-sm"
                          >
                            <svg className="w-3.5 h-3.5 opacity-60 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {tag.name}
                          </span>
                        ))}
                      </>
                    )}
                  </div>

                  {/* 文章摘要 */}
                  {article.excerpt && (
                    <div className="mb-8 p-5 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border-l-4 border-primary">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  )}

                  {/* 文章正文 */}
                  <div className="vditor-reset data-reading-target">
                    <MarkdownRenderer content={article.content} />
                  </div>

                  {/* 统计数据 */}
                  <div className="flex items-center justify-center gap-4 py-6 border-t border-border/50 mt-8">
                    {/* 浏览量 */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
                      <div className="w-7 h-7 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">{article.viewCount || 0}</span>
                    </div>

                    {/* 点赞数 */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
                      <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">{article.likeCount || 0}</span>
                    </div>

                    {/* 评论数 */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
                      <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">{article.commentCount || 0}</span>
                    </div>
                  </div>

                  <ContentLikeButton
                    contentType="ARTICLE"
                    contentId={article.id}
                    initialLikeCount={article.likeCount || 0}
                  />
                  <ArticleCopyright article={article} author={author} />

                  {/* 二次元评论组件 - 根据配置显示 */}
                  {componentConfig.articleCommentEnabled && (
                    <div className="mt-12">
                      <AnimeComment postId={article.id} />
                    </div>
                  )}
                </div>
              </Card>
            </article>

            {/* 侧边栏菜单 - 只在大屏幕显示 */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <ArticleMenu article={article} />
            </aside>
          </div>
        </main>

        {/* 移动端菜单 */}
        <ArticleMenuMobile article={article} />
      </>
    );
  } catch (error) {
    console.error('Failed to load article:', error);
    notFound();
  }
}
