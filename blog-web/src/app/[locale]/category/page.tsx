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
        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="mb-10">
            <h1 className="text-5xl font-bold mb-4 gradient-text">{t('categories')}</h1>
            <p className="text-muted text-lg">文章分类</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="group bg-card border border-border rounded-xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold group-hover:text-primary transition-colors">{category.name}</h2>
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

