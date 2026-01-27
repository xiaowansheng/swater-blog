import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import { tagApi } from '@/lib/api/tag';
import { Link } from '@/lib/i18n/routing';
import { getCoverConfig } from '@/lib/api/config.server';
import { Card } from '@/components/ui/Card';
import { DEFAULT_COVER_CONFIG, ISR_REVALIDATE } from '@/lib/constants';
import type { TagVO } from '@/types';

export const revalidate = ISR_REVALIDATE.TAG;

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
          <p>{t('noData')}</p>
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
