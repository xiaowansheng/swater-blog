import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import { ISR_REVALIDATE } from '@/lib/constants';

export const revalidate = ISR_REVALIDATE.ABOUT;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('common');

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
          <h1 className="text-5xl font-bold mb-8 gradient-text">{t('about')}</h1>
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-secondary prose-code:px-1 prose-code:rounded prose-pre:bg-secondary/50">
            <MarkdownRenderer content="# About\n\nThis is a blog platform built with Next.js." />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

