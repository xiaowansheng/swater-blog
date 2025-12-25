import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/layout/PageHeader';
import { archiveApi } from '@/lib/api/archive';
import { categoryApi } from '@/lib/api/category';
import { tagApi } from '@/lib/api/tag';
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
    const [archives, categories, tags] = await Promise.all([
      archiveApi.getList(),
      categoryApi.getList().catch(() => []),
      tagApi.getList().catch(() => []),
    ]);

    return (
      <>
        <Header />
        <PageHeader title={t('archives')} description="文章归档、分类与标签" />
        <main className="container flex-1 px-4 py-12 mx-auto space-y-12">
          {categories.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">文章分类</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.id}`}
                    className="group bg-card border border-border rounded-xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{category.name}</h3>
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
            </section>
          )}

          {tags.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">所有标签</h2>
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
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold mb-6">时间归档</h2>
            <div className="space-y-4">
              {archives.map((archive) => (
                <Link
                  key={`${archive.year}-${archive.month}`}
                  href={`/archive/${archive.year}${archive.month ? `/${archive.month}` : ''}`}
                  className="group block bg-card border border-border rounded-xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {archive.year}年{archive.month ? ` ${archive.month}月` : ''}
                      </h3>
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
          </section>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load archives:', error);
    return (
      <>
        <Header />
        <PageHeader title={t('archives')} description="文章归档" />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

