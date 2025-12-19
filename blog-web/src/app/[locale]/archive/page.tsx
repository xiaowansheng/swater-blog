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
        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="mb-10">
            <h1 className="text-5xl font-bold mb-4 gradient-text">{t('archives')}</h1>
            <p className="text-muted text-lg">文章归档</p>
          </div>
          <div className="space-y-4">
            {archives.map((archive) => (
              <Link
                key={`${archive.year}-${archive.month}`}
                href={`/archive/${archive.year}${archive.month ? `/${archive.month}` : ''}`}
                className="group block bg-card border border-border rounded-xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {archive.year}年{archive.month ? ` ${archive.month}月` : ''}
                    </h2>
                    <p className="text-muted flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {archive.count} {t('article.title')}
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
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

