import { MetadataRoute } from 'next';
import { routing } from '@/lib/i18n/routing';
import { articleApi } from '@/lib/api/article';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const sitemapEntries: MetadataRoute.Sitemap = [];

  const alternatesFor = (path: string) => ({
    languages: Object.fromEntries(
      routing.locales.map((locale) => [locale, `${baseUrl}/${locale}${path}`])
    ),
  });

  for (const locale of routing.locales) {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: alternatesFor(''),
    });
  }

  try {
    const articles = await articleApi.getList({ page: 1, size: 100 });
    for (const article of articles.records) {
      const lastModified = new Date(article.updateTime);
      for (const locale of routing.locales) {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/post/${article.articleKey}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: alternatesFor(`/post/${article.articleKey}`),
        });
      }
    }
  } catch (error) {
    console.error('Failed to generate sitemap for articles:', error);
  }

  return sitemapEntries;
}
