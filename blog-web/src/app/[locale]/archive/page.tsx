import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/layout/PageHeader';
import { archiveApi } from '@/lib/api/archive';
import { categoryApi } from '@/lib/api/category';
import { tagApi } from '@/lib/api/tag';
import { Link } from '@/lib/i18n/routing';
import { ISR_REVALIDATE } from '@/lib/constants';
import type { ArchiveVO } from '@/types';

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

    // 按年分组
    const groupedArchives = archives.reduce((acc: Record<number, ArchiveVO[]>, archive) => {
      if (!acc[archive.year]) {
        acc[archive.year] = [];
      }
      acc[archive.year].push(archive);
      return acc;
    }, {});

    // 排序并计算每年的文章总数
    const sortedYears = Object.keys(groupedArchives)
      .map(Number)
      .sort((a, b) => b - a);

    // 每年内的月份按倒序排序
    sortedYears.forEach(year => {
      groupedArchives[year].sort((a, b) => b.month - a.month);
    });

    const totalPosts = archives.reduce((sum, archive) => sum + archive.postCount, 0);
    const totalYears = sortedYears.length;

    return (
      <>
        <Header />
        <PageHeader title={t('archives')} description="文章归档、分类与标签" />
        <main className="container flex-1 px-4 py-12 mx-auto space-y-12">
          {/* 归档统计 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{totalYears}</div>
              <div className="text-muted text-sm">归档年数</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{totalPosts}</div>
              <div className="text-muted text-sm">文章总数</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{archives.length}</div>
              <div className="text-muted text-sm">归档月数</div>
            </div>
          </section>

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

          {/* 时间轴归档 */}
          <section>
            <h2 className="text-2xl font-bold mb-6">时间归档</h2>
            <div className="space-y-8">
              {sortedYears.map((year) => {
                const yearArchives = groupedArchives[year];
                const yearTotal = yearArchives.reduce((sum, a) => sum + a.postCount, 0);

                return (
                  <div key={year} className="relative">
                    {/* 年份标题 */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-primary">{year}年</h3>
                        <p className="text-muted text-sm mt-1">共 {yearTotal} 篇文章</p>
                      </div>
                    </div>

                    {/* 月份列表 */}
                    <div className="ml-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {yearArchives.map((archive) => (
                        <Link
                          key={`${archive.year}-${archive.month}`}
                          href={`/archive/${archive.year}/${archive.month}`}
                          className="group bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold group-hover:text-primary transition-colors">
                              {archive.month}月
                            </span>
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                              {archive.postCount}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
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

