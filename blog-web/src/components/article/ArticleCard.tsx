'use client';

import { motion } from 'framer-motion';
import { Link } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { formatDate } from '@/lib/utils/format';
import type { PostVO } from '@/types';
import Image from 'next/image';

interface ArticleCardProps {
  article: PostVO;
  variant?: 'list' | 'card';
}

export default function ArticleCard({ article, variant }: ArticleCardProps) {
  const t = useTranslations('common');
  const pathname = usePathname();
  const cardVariant = variant || (article.cover ? 'card' : 'list');
  const locale = pathname?.split('/')[1] || 'zh';

  if (cardVariant === 'card' && article.cover) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
      >
        <Link href={`/post/${article.slug}`}>
          <div className="relative h-48 w-full">
            <Image
              src={article.cover}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 line-clamp-2">{article.title}</h2>
            {article.excerpt && (
              <p className="text-foreground/70 mb-4 line-clamp-2">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-foreground/60">
              <span>{formatDate(article.publishedAt || article.createTime, 'YYYY-MM-DD', locale)}</span>
              <span>{t('viewCount')}: {article.viewCount}</span>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      <Link href={`/post/${article.slug}`}>
        <h2 className="text-2xl font-bold mb-2">{article.title}</h2>
        {article.excerpt && (
          <p className="text-foreground/70 mb-4 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-foreground/60">
          <span>{formatDate(article.publishedAt || article.createTime, 'YYYY-MM-DD', locale)}</span>
          <span>{t('viewCount')}: {article.viewCount}</span>
          {article.categoryName && (
            <span className="px-2 py-1 bg-primary/10 rounded">{article.categoryName}</span>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

