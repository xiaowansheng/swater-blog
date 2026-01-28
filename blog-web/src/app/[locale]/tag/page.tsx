import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import { tagApi } from '@/lib/api/tag';
import { Link } from '@/lib/i18n/routing';
import { getCoverConfig } from '@/lib/api/config.server';
import { Card } from '@/components/ui/Card';
import { DEFAULT_COVER_CONFIG } from '@/lib/constants';
import type { TagVO } from '@/types';

export const revalidate = 600;

export default async function TagListPage() {
  const t = await getTranslations('common');

  let cover = DEFAULT_COVER_CONFIG;
  try {
    cover = await getCoverConfig();
  } catch (error) {
    console.error('Failed to load cover config:', error);
  }

  let tags: TagVO[] = [];
  let hasError = false;
  try {
    tags = await tagApi.getList();
  } catch (error) {
    console.error('Failed to load tags:', error);
    hasError = true;
  }

  if (hasError) {
    return (
      <>
        <PageHeader
          title={t('tags')}
          description={t('tagDescription')}
          coverImage={cover.tag}
        />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <div className="overflow-hidden relative p-8 sm:p-12 md:p-16 text-center modern-card">
            <div className="absolute inset-0 bg-gradient-to-br via-transparent from-red-500/10 to-orange-500/10"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br rounded-2xl from-red-500/20 to-orange-500/20">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{t('error')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{t('apiNotConnected')}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t('tags')}
        description={t('tagDescription')}
        coverImage={cover.tag}
      />
      <main className="container flex-1 px-4 py-12 mx-auto">
        <div className="flex flex-wrap gap-3">
          {tags.map((tag, index) => (
            <Link key={tag.id} href={`/tag/${tag.tagKey}`} className="block focus:outline-none">
              <Card
                className="group px-5 py-3 flex items-center justify-center overflow-hidden relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10 flex items-center">
                  <span className="font-medium group-hover:text-primary transition-colors">{tag.name}</span>
                  {tag.articleCount !== undefined && (
                    <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                      {tag.articleCount}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
