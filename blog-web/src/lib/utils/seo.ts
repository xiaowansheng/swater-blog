import type { Metadata } from 'next';
import type { PostVO } from '@/types';

export function generateArticleMetadata(
  article: PostVO,
  locale: string = 'zh'
): Metadata {
  const title = `${article.title} | Swater Blog`;
  const description = article.excerpt || article.title;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updateTime,
      authors: article.authorName ? [article.authorName] : undefined,
      images: article.cover ? [article.cover] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.cover ? [article.cover] : undefined,
    },
    alternates: {
      canonical: `/${locale}/post/${article.articleKey}`,
      languages: {
        'zh': `/zh/post/${article.articleKey}`,
        'en': `/en/post/${article.articleKey}`,
      },
    },
  };
}

export function generatePageMetadata(
  title: string,
  description: string,
  locale: string = 'zh'
): Metadata {
  return {
    title: `${title} | Swater Blog`,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'zh': '/zh',
        'en': '/en',
      },
    },
  };
}

