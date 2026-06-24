import type { PostVO } from '@/types';

interface StructuredDataProps {
  article: PostVO;
  locale: string;
  url: string;
  siteName?: string;
}

export function ArticleStructuredData({ article, locale, url, siteName = 'Swater Blog' }: StructuredDataProps) {
  const authorName = article.authorName || siteName;
  const coverUrl = article.cover || '';
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `/${locale}`,
      },
      ...(article.categoryName ? [{
        '@type': 'ListItem' as const,
        position: 2,
        name: article.categoryName,
        item: `/${locale}/category/${article.categoryKey || ''}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: article.categoryName ? 3 : 2,
        name: article.title,
        item: url,
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || article.title,
    ...(coverUrl ? { image: coverUrl } : {}),
    datePublished: article.publishedAt || article.createTime,
    dateModified: article.updateTime || article.publishedAt || article.createTime,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(article.categoryName ? {
      articleSection: article.categoryName,
    } : {}),
    ...(article.tags?.length ? {
      keywords: article.tags.map(t => t.name).join(', '),
    } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </>
  );
}

export function HomePageStructuredData({ locale, siteName = 'Swater Blog', description = '' }: {
  locale: string;
  siteName?: string;
  description?: string;
}) {
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    description,
    url: `/${locale}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `/${locale}/search?keyword={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteName,
    url: `/${locale}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
    </>
  );
}
