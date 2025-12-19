import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { categoryApi } from '@/lib/api/category';
import { Link } from '@/lib/i18n/routing';
import { ISR_REVALIDATE } from '@/lib/constants';

export const revalidate = ISR_REVALIDATE.CATEGORY;

export default async function CategoryListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('common');

  try {
    const categories = await categoryApi.getList();

    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <h1 className="text-4xl font-bold mb-8">{t('categories')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-bold mb-2">{category.name}</h2>
                {category.description && (
                  <p className="text-foreground/70 mb-2">{category.description}</p>
                )}
                {category.articleCount !== undefined && (
                  <p className="text-sm text-foreground/60">
                    {category.articleCount} {t('article.title')}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load categories:', error);
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <p>{t('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

