import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import AuthorCard from '@/components/author/AuthorCard';
import { getAboutContent, getCoverConfig, getAuthorInfo } from '@/lib/api/config.server';
import { ISR_REVALIDATE } from '@/lib/constants';

export const revalidate = ISR_REVALIDATE.ABOUT;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('common');
  const [aboutContent, cover, author] = await Promise.all([
    getAboutContent(),
    getCoverConfig(),
    getAuthorInfo()
  ]);

  return (
    <>
      <PageHeader title={t('about')} description={t('aboutDescription')} coverImage={cover.about} />
      <main className="container flex-1 px-4 py-12 mx-auto">
        {/* 作者信息卡片 + 关于内容 */}
        <AuthorCard author={author}>
          {aboutContent ? (
            <div className="vditor-reset">
              <MarkdownRenderer content={aboutContent} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <p className="text-base font-medium text-foreground/70">{t('noAboutContent')}</p>
                <p className="text-sm text-foreground/50">{t('noAboutContentHint')}</p>
              </div>
            </div>
          )}
        </AuthorCard>
      </main>
    </>
  );
}

