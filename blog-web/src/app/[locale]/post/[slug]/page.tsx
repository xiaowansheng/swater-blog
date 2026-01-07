import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ArticleHeader from '@/components/article/ArticleHeader';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import ArticleMeta from '@/components/article/ArticleMeta';
import ArticleCopyright from '@/components/article/ArticleCopyright';
import ArticleMenu from '@/components/article/ArticleMenu';
import ArticleMenuMobile from '@/components/article/ArticleMenuMobile';
import ReadingProgress from '@/components/widgets/ReadingProgress';
import { articleApi } from '@/lib/api/article';
import { getAuthorInfo } from '@/lib/api/config.server';
import { ISR_REVALIDATE } from '@/lib/constants';
import { generateArticleMetadata } from '@/lib/utils/seo';

export const revalidate = ISR_REVALIDATE.POST_DETAIL;

export async function generateStaticParams() {
  return [];
}

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
    const [article, author] = await Promise.all([
      articleApi.getByKey(slug),
      getAuthorInfo()
    ]);

    return (
      <>
        <ReadingProgress />
        <Header />
        
        {/* 文章头部 */}
        <ArticleHeader article={article} author={author} locale={locale} />

        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="lg:flex lg:gap-8">
            {/* 主要内容 */}
            <article className="flex-1 bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
              <ArticleMeta article={article} />
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-secondary prose-code:px-1 prose-code:rounded prose-pre:bg-secondary/50">
                <MarkdownRenderer content={article.content} />
              </div>
              <ArticleCopyright article={article} author={author} />
            </article>

            {/* 侧边栏菜单 - 只在大屏幕显示 */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <ArticleMenu article={article} />
            </aside>
          </div>
        </main>
        
        {/* 移动端菜单 */}
        <ArticleMenuMobile article={article} />
        
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load article:', error);
    notFound();
  }
}

