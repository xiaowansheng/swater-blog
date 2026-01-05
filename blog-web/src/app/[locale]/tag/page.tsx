import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/layout/PageHeader';
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
        <PageHeader title={t('tags')} description="所有标签" />
        <main className="container flex-1 px-4 py-12 mx-auto">
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.tagKey}`}
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
        <PageHeader title={t('tags')} description="所有标签" />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

