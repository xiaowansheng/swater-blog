import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { archiveApi } from '@/lib/api/archive';
import { Link } from '@/lib/i18n/routing';
import { ISR_REVALIDATE } from '@/lib/constants';

export const revalidate = ISR_REVALIDATE.ARCHIVE;

export default async function ArchiveListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('common');

  try {
    const archives = await archiveApi.getList();

    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <h1 className="text-4xl font-bold mb-8">{t('archives')}</h1>
          <div className="space-y-6">
            {archives.map((archive) => (
              <div key={`${archive.year}-${archive.month}`} className="bg-card border rounded-lg p-6">
                <Link href={`/archive/${archive.year}${archive.month ? `/${archive.month}` : ''}`}>
                  <h2 className="text-2xl font-bold mb-2">
                    {archive.year}年{archive.month ? ` ${archive.month}月` : ''}
                  </h2>
                  <p className="text-foreground/70">
                    {archive.count} {t('article.title')}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load archives:', error);
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

