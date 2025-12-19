import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { tagApi } from '@/lib/api/tag';
import { Link } from '@/lib/i18n/routing';
import { ISR_REVALIDATE } from '@/lib/constants';

export const revalidate = ISR_REVALIDATE.TAG;

export default async function TagListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('common');

  try {
    const tags = await tagApi.getList();

    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="mb-10">
            <h1 className="text-5xl font-bold mb-4 gradient-text">{t('tags')}</h1>
            <p className="text-muted text-lg">所有标签</p>
          </div>
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
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load tags:', error);
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

