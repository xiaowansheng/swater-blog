import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/layout/PageHeader';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import { ISR_REVALIDATE } from '@/lib/constants';
import { getAboutContent } from '@/lib/api/config.server';

export const revalidate = ISR_REVALIDATE.ABOUT;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('common');
  const aboutContent = await getAboutContent();

  return (
    <>
      <Header />
      <PageHeader title={t('about')} description="关于我" />
      <main className="container flex-1 px-4 py-12 mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
          <div className="vditor-reset">
            <MarkdownRenderer content={aboutContent} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

