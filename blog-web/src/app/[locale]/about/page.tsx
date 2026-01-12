import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import { ISR_REVALIDATE } from '@/lib/constants';
import { getAboutContent, getCoverConfig } from '@/lib/api/config.server';

export const revalidate = ISR_REVALIDATE.ABOUT;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('common');
  const [aboutContent, cover] = await Promise.all([
    getAboutContent(),
    getCoverConfig()
  ]);

  return (
    <>
      <PageHeader title={t('about')} description="关于我" coverImage={cover.about} />
      <main className="container flex-1 px-4 py-12 mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
          {aboutContent ? (
            <div className="vditor-reset">
              <MarkdownRenderer content={aboutContent} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 space-y-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 md:w-12 md:h-12 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg md:text-xl font-medium text-foreground/70">暂无介绍内容</p>
                <p className="text-sm md:text-base text-foreground/50">博主正在努力撰写中，敬请期待</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

