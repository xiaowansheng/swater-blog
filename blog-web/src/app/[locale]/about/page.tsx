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
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">{t('about')}</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <MarkdownRenderer content="# About\n\nThis is a blog platform built with Next.js." />
        </div>
      </main>
      <Footer />
    </>
  );
}

