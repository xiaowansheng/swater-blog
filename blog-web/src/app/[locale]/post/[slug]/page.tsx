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
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text leading-tight line-clamp-1 overflow-hidden text-ellipsis" title={article.title}>
            {article.title}
          </h1>

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

            {/* 创建时间 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-200">
                {formatDate(article.createTime, 'YYYY年MM月DD日', locale)}
              </span>
              {/* {article.updateTime && article.updateTime !== article.createTime && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  (更新于 {formatDate(article.updateTime, 'MM月DD日', locale)})
                </span>
              )} */}
            </div>

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
          </div>

          {/* 标签 */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:text-primary dark:hover:text-primary transition-all shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* 统计数据 */}
          <div className="flex items-center justify-center gap-3 mt-4 text-sm">
            {/* 浏览量 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
              <div className="w-7 h-7 rounded-full bg-orange-500/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-200 font-medium">{article.viewCount || 0}</span>
            </div>

            {/* 点赞数 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
              <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-200 font-medium">{article.likeCount || 0}</span>
            </div>

            {/* 评论数 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/20">
              <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-200 font-medium">{article.commentCount || 0}</span>
            </div>
          </div>
        </PageHeader>

        <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 flex-1">
          <div className="min-w-0 lg:flex lg:gap-8">
            {/* 主要内容 */}
            <article className="min-w-0 flex-1">
              <Card hoverEffect={false} className="w-full overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-12 rounded-2xl shadow-sm border border-border bg-card">
                  {/* <ArticleMeta article={article} /> */}
                  {/* 文章摘要 */}
                  {article.excerpt && (
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  )}
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
