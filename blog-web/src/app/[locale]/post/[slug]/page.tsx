import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
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
import { ISR_REVALIDATE } from '@/lib/constants';
import { generateArticleMetadata } from '@/lib/utils/seo';
import { formatDate } from '@/lib/utils/format';

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
          <h1 className="text-4xl md:text-6xl font-bold gradient-text leading-tight">
            {article.title}
          </h1>

          {/* 文章摘要 */}
          {article.excerpt && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-6">
              {article.excerpt}
            </p>
          )}

          {/* 文章元信息 */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm mt-6">
            {/* 作者 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">{author?.name || article.authorName || '作者'}</span>
            </div>

            {/* 发布时间 */}
            {article.publishedAt && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-200">{formatDate(article.publishedAt, 'YYYY年MM月DD日', locale)}</span>
              </div>
            )}

            {/* 分类 */}
            {article.categoryName && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-200">{article.categoryName}</span>
              </div>
            )}

            {/* 阅读量 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="text-gray-700 dark:text-gray-200">
                <ArticleLiveStats
                  id={article.id}
                  initial={{
                    viewCount: article.viewCount || 0,
                    likeCount: article.likeCount || 0,
                    commentCount: article.commentCount || 0,
                  }}
                />
              </div>
            </div>
          </div>

          {/* 标签 */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </PageHeader>

        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="lg:flex lg:gap-8">
            {/* 主要内容 */}
            <article className="flex-1 bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
              {/* <ArticleMeta article={article} /> */}
              <div className="vditor-reset" data-reading-target>
                <MarkdownRenderer content={article.content} />
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

