import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import { categoryApi } from '@/lib/api/category';
import { Link } from '@/lib/i18n/routing';
import { ISR_REVALIDATE } from '@/lib/constants';
import { getCoverConfig } from '@/lib/api/config.server';

export const revalidate = ISR_REVALIDATE.CATEGORY;

export default async function CategoryListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('common');

  try {
    const [categories, cover] = await Promise.all([
      categoryApi.getList(),
      getCoverConfig()
    ]);

    return (
      <>
        <PageHeader title={t('categories')} description={t('categoryDescription')} coverImage={cover.category} />
        <main className="container flex-1 px-3 sm:px-4 py-8 sm:py-12 mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.categoryKey}`}
                className="group bg-card border border-border rounded-xl p-4 sm:p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <h2 className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors">{category.name}</h2>
                  {category.articleCount !== undefined && (
                    <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {category.articleCount}
                    </span>
                  )}
                </div>
                {category.description && (
                  <p className="text-sm sm:text-base text-foreground/70 mb-2 line-clamp-2">{category.description}</p>
                )}
              </Link>
            ))}
          </div>
        </main>
      </>
    );
  } catch (error) {
    console.error('Failed to load categories:', error);
    const cover = await getCoverConfig();
    return (
      <>
        <PageHeader title={t('categories')} description={t('categoryDescription')} coverImage={cover.category} />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
      </>
    );
  }
}

