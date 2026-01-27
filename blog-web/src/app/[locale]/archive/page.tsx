import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import { categoryApi } from '@/lib/api/category';
import { tagApi } from '@/lib/api/tag';
import { Link } from '@/lib/i18n/routing';
import { getCoverConfig } from '@/lib/api/config.server';
import ArchiveTimeline from '@/components/archive/ArchiveTimeline';
import { Card } from '@/components/ui/Card';
import { DEFAULT_COVER_CONFIG } from '@/lib/constants';
import type { CategoryVO, TagVO } from '@/types';

export const revalidate = 3600;

export default async function ArchiveListPage() {
  const t = await getTranslations('common');

  let cover = DEFAULT_COVER_CONFIG;
  try {
    cover = await getCoverConfig();
  } catch (error) {
    console.error('Failed to load cover config:', error);
  }

  const [categories, tags] = await Promise.all([
    categoryApi.getList().catch((): CategoryVO[] => []),
    tagApi.getList().catch((): TagVO[] => []),
  ]);

  return (
    <>
      <PageHeader title={t('archives')} description={t('archiveDescription')} coverImage={cover.archive} />
      <main className="container flex-1 px-4 py-12 mx-auto space-y-12">
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] -z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-accent/[0.03] to-transparent rounded-bl-full -z-10 pointer-events-none"></div>

          <div className="absolute top-4 right-4 text-accent/20 text-sm animate-twinkle pointer-events-none">✦</div>
          <div className="absolute bottom-8 right-12 text-primary/20 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '0.5s' }}>
            ✧
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="relative">
                <span className="text-3xl">📁</span>
                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full"></div>
              </span>
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                {t('categories')}
              </span>
            </h2>
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <Link key={category.id} href={`/category/${category.categoryKey}`} className="block h-full">
                    <Card
                      className="h-full p-6 group relative overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{category.name}</h3>
                          {category.articleCount !== undefined && (
                            <span className="px-3 py-1 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                              {category.articleCount}
                            </span>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-foreground/70 mb-2 line-clamp-2">{category.description}</p>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-6 sm:p-8 text-center">
                <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
                <div className="relative z-10">
                  <p className="text-muted-foreground">{t('noCategories')}</p>
                </div>
              </Card>
            )}
          </div>
        </section>

        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] via-transparent to-primary/[0.02] -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary/[0.03] to-transparent rounded-tr-full -z-10 pointer-events-none"></div>

          <div className="absolute top-8 left-4 text-primary/20 text-sm animate-twinkle pointer-events-none" style={{ animationDelay: '0.3s' }}>
            ✦
          </div>
          <div className="absolute bottom-4 right-8 text-accent/20 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '0.8s' }}>
            ✧
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="relative">
                <span className="text-3xl">🏷️</span>
                <div className="absolute inset-0 bg-accent/20 blur-md rounded-full"></div>
              </span>
              <span className="bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent">
                {t('allTags')}
              </span>
            </h2>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {tags.map((tag, index) => (
                  <Link key={tag.id} href={`/tag/${tag.tagKey}`} className="block">
                    <Card
                      className="group px-5 py-3 flex items-center justify-center overflow-hidden relative"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative z-10 flex items-center gap-2">
                        <span className="font-medium group-hover:text-primary transition-colors">{tag.name}</span>
                        {tag.articleCount !== undefined && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                            {tag.articleCount}
                          </span>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-6 sm:p-8 text-center">
                <div className="absolute inset-0 bg-gradient-to-br via-transparent from-accent/5 to-primary/5"></div>
                <div className="relative z-10">
                  <p className="text-muted-foreground">{t('noTags')}</p>
                </div>
              </Card>
            )}
          </div>
        </section>

        <ArchiveTimeline />
      </main>
    </>
  );
}
