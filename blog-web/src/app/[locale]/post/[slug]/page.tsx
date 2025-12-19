import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import ArticleMeta from '@/components/article/ArticleMeta';
import ReadingProgress from '@/components/widgets/ReadingProgress';
import FloatingToolbar from '@/components/widgets/FloatingToolbar';
import { articleApi } from '@/lib/api/article';
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
    const article = await articleApi.getBySlug(slug);
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
    const article = await articleApi.getBySlug(slug);

    return (
      <>
        <ReadingProgress />
        <FloatingToolbar />
        <Header />
        <main className="container mx-auto px-4 py-12 flex-1 max-w-4xl">
          <article className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{article.title}</h1>
            <ArticleMeta article={article} />
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-secondary prose-code:px-1 prose-code:rounded prose-pre:bg-secondary/50">
              <MarkdownRenderer content={article.content} />
            </div>
          </article>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load article:', error);
    notFound();
  }
}

