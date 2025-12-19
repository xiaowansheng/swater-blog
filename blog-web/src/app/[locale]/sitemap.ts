import { MetadataRoute } from 'next';
import { routing } from '@/lib/i18n/routing';
import { articleApi } from '@/lib/api/article';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    });

    try {
      const articles = await articleApi.getList({ page: 1, size: 100 });
      for (const article of articles.records) {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/post/${article.slug}`,
          lastModified: new Date(article.updateTime),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    } catch (error) {
      console.error('Failed to generate sitemap for articles:', error);
    }
  }

  return sitemapEntries;
}

