import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import { categoryApi } from '@/lib/api/category';
import { Link } from '@/lib/i18n/routing';
import { getCoverConfig } from '@/lib/api/config.server';
import { Card } from '@/components/ui/Card';

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
                  {/* 悬停背景 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <h2 className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors">{category.name}</h2>
                      {category.articleCount !== undefined && (
                        <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                          {category.articleCount}
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm sm:text-base text-foreground/70 mb-2 line-clamp-2">{category.description}</p>
                    )}
                  </div>
                </Card>
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

