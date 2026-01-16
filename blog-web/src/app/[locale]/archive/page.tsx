import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import { categoryApi } from '@/lib/api/category';
import { tagApi } from '@/lib/api/tag';
import { Link } from '@/lib/i18n/routing';
import { ISR_REVALIDATE } from '@/lib/constants';
import { getCoverConfig } from '@/lib/api/config.server';
import ArchiveTimeline from '@/components/archive/ArchiveTimeline';

export const revalidate = ISR_REVALIDATE.ARCHIVE;

export default async function ArchiveListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('common');

  try {
    const [categories, tags, cover] = await Promise.all([
      categoryApi.getList().catch(() => []),
      tagApi.getList().catch(() => []),
      getCoverConfig()
    ]);

    return (
      <>
        <PageHeader title={t('archives')} description={t('archiveDescription')} coverImage={cover.archive} />
        <main className="container flex-1 px-4 py-12 mx-auto space-y-12">
          {/* 分类和标签 */}
          <section className="relative">
            {/* 装饰背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] -z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-accent/[0.03] to-transparent rounded-bl-full -z-10 pointer-events-none"></div>

            {/* 星星装饰 */}
            <div className="absolute top-4 right-4 text-accent/20 text-sm animate-twinkle pointer-events-none">✦</div>
            <div className="absolute bottom-8 right-12 text-primary/20 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '0.5s' }}>✧</div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="relative">
                  <span className="text-3xl">📁</span>
                  <div className="absolute inset-0 bg-primary/20 blur-md rounded-full"></div>
                </span>
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">{t('categories')}</span>
              </h2>
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category, index) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.categoryKey}`}
                      className="group relative bg-card border border-border rounded-xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* 悬停背景 */}
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
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden relative p-6 sm:p-8 text-center modern-card">
                  <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
                  <div className="relative z-10">
                    <p className="text-muted-foreground">{t('noCategories')}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="relative">
            {/* 装饰背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] via-transparent to-primary/[0.02] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary/[0.03] to-transparent rounded-tr-full -z-10 pointer-events-none"></div>

            {/* 星星装饰 */}
            <div className="absolute top-8 left-4 text-primary/20 text-sm animate-twinkle pointer-events-none" style={{ animationDelay: '0.3s' }}>✦</div>
            <div className="absolute bottom-4 right-8 text-accent/20 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '0.8s' }}>✧</div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="relative">
                  <span className="text-3xl">🏷️</span>
                  <div className="absolute inset-0 bg-accent/20 blur-md rounded-full"></div>
                </span>
                <span className="bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent">{t('allTags')}</span>
              </h2>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {tags.map((tag, index) => (
                    <Link
                      key={tag.id}
                      href={`/tag/${tag.id}`}
                      className="group relative px-5 py-3 bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      {/* 悬停背景 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative z-10 flex items-center gap-2">
                        <span className="font-medium group-hover:text-primary transition-colors">{tag.name}</span>
                        {tag.articleCount !== undefined && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                            {tag.articleCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden relative p-6 sm:p-8 text-center modern-card">
                  <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
                  <div className="relative z-10">
                    <p className="text-muted-foreground">{t('noTags')}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 时间轴归档 */}
          <section className="relative">
            {/* 装饰背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] -z-10 pointer-events-none"></div>
            <div className="absolute top-1/2 right-0 w-32 h-32 bg-gradient-to-bl from-primary/[0.03] to-transparent rounded-tl-full -z-10 pointer-events-none"></div>

            {/* 星星装饰 */}
            <div className="absolute top-12 right-20 text-primary/20 text-sm animate-twinkle pointer-events-none" style={{ animationDelay: '0.6s' }}>✦</div>
            <div className="absolute bottom-12 left-20 text-accent/20 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '1.1s' }}>✧</div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="relative">
                  <span className="text-3xl">📅</span>
                  <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-pulse"></div>
                </span>
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">{t('timelineArchive')}</span>
              </h2>
              <ArchiveTimeline />
            </div>
          </section>
        </main>
      </>
    );
  } catch (error) {
    console.error('Failed to load archives:', error);
    const cover = await getCoverConfig();
    return (
      <>
        <PageHeader title={t('archives')} description={t('archiveDescriptionShort')} coverImage={cover.archive} />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
      </>
    );
  }
}

