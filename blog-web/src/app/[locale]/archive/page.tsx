import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import { categoryApi } from '@/lib/api/category';
import { tagApi } from '@/lib/api/tag';
import { Link } from '@/lib/i18n/routing';
import { ISR_REVALIDATE } from '@/lib/constants';
import ArchiveTimeline from '@/components/archive/ArchiveTimeline';

export const revalidate = ISR_REVALIDATE.ARCHIVE;

export default async function ArchiveListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('common');

  try {
    const [categories, tags] = await Promise.all([
      categoryApi.getList().catch(() => []),
      tagApi.getList().catch(() => []),
    ]);

    return (
      <>
        <PageHeader title={t('archives')} description="文章归档、分类与标签" />
        <main className="container flex-1 px-4 py-12 mx-auto space-y-12">
          {/* 分类和标签 */}
          <section>
            <h2 className="text-2xl font-bold mb-6">文章分类</h2>
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.categoryKey}`}
                    className="group bg-card border border-border rounded-xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{category.name}</h3>
                      {category.articleCount !== undefined && (
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {category.articleCount}
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-foreground/70 mb-2 line-clamp-2">{category.description}</p>
                    )}
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
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">所有标签</h2>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.id}`}
                    className="group px-5 py-3 bg-card border border-border rounded-xl hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                  >
                    <span className="font-medium group-hover:text-primary transition-colors">{tag.name}</span>
                    {tag.articleCount !== undefined && (
                      <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {tag.articleCount}
                      </span>
                    )}
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
          </section>

          {/* 时间轴归档 */}
          <section>
            <h2 className="text-2xl font-bold mb-6">时间归档</h2>
            <ArchiveTimeline />
          </section>
        </main>
      </>
    );
  } catch (error) {
    console.error('Failed to load archives:', error);
    return (
      <>
        <PageHeader title={t('archives')} description="文章归档" />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
      </>
    );
  }
}

