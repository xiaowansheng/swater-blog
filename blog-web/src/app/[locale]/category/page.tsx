import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import { categoryApi } from '@/lib/api/category';
import { Link } from '@/lib/i18n/routing';
import { getCoverConfig } from '@/lib/api/config.server';
import { Card } from '@/components/ui/Card';
import { DEFAULT_COVER_CONFIG } from '@/lib/constants';
import type { CategoryVO } from '@/types';

export const revalidate = 600;

export default async function CategoryListPage() {
  const t = await getTranslations('common');

  let cover = DEFAULT_COVER_CONFIG;
  try {
    cover = await getCoverConfig();
  } catch (error) {
    console.error('Failed to load cover config:', error);
  }

  let categories: CategoryVO[] = [];
  let hasError = false;
  try {
    categories = await categoryApi.getList();
  } catch (error) {
    console.error('Failed to load categories:', error);
    hasError = true;
  }

  if (hasError) {
    return (
      <>
        <PageHeader
          title={t('categories')}
          description={t('categoryDescription')}
          coverImage={cover.category}
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
        title={t('categories')}
        description={t('categoryDescription')}
        coverImage={cover.category}
      />
      <main className="container flex-1 px-3 sm:px-4 py-8 sm:py-12 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/category/${category.categoryKey}`}
              className="block h-full focus:outline-none"
            >
              <Card
                className="h-full p-4 sm:p-6 group relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <h2 className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors">
                      {category.name}
                    </h2>
                    {category.articleCount !== undefined && (
                      <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                        {category.articleCount}
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm sm:text-base text-foreground/70 mb-2 line-clamp-2">
                      {category.description}
                    </p>
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
