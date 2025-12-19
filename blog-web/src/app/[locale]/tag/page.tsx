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
        <main className="container mx-auto px-4 py-8 flex-1">
          <h1 className="text-4xl font-bold mb-8">{t('tags')}</h1>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className="px-4 py-2 bg-card border rounded-lg hover:shadow-lg transition-shadow"
              >
                <span className="font-medium">{tag.name}</span>
                {tag.articleCount !== undefined && (
                  <span className="ml-2 text-sm text-foreground/60">
                    ({tag.articleCount})
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

