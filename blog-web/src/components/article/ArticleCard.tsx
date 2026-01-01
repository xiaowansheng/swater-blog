'use client';

import { motion } from 'framer-motion';
import { Link, usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { formatDate } from '@/lib/utils/format';
import type { PostVO } from '@/types';
import Image from '@/components/common/ImageWithPreview';

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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden relative group modern-card"
      >
        <Link href={`/post/${article.articleKey}`}>
          <div className="overflow-hidden relative w-full h-64">
            <Image
              src={article.cover}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              previewEnabled={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-500 from-black/80 via-black/40 group-hover:opacity-100"></div>
            <div className="absolute top-4 right-4 opacity-0 transition-all duration-300 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
              {article.categoryName && (
                <span className="px-4 py-1.5 bg-primary/90 backdrop-blur-sm text-white rounded-full text-xs font-semibold shadow-lg">
                  {article.categoryName}
                </span>
              )}
            </div>
          </div>
          <div className="relative p-6">
            <div className="absolute top-0 right-6 left-6 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity via-primary/60 group-hover:opacity-100"></div>
            <h2 className="text-2xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-all duration-300 bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-[length:200%_100%] group-hover:bg-[length:100%_100%] bg-clip-text relative">
              {article.title}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500 rounded-full"></span>
            </h2>
            {article.excerpt && (
              <p className="mb-4 leading-relaxed text-foreground/70 line-clamp-2">{article.excerpt}</p>
            )}
            <div className="flex flex-wrap gap-4 items-center text-sm text-muted">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(article.publishedAt || article.createTime, 'YYYY-MM-DD', locale)}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.viewCount}
              </span>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="relative p-6 group modern-card"
    >
      <Link href={`/post/${article.articleKey}`}>
        <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity via-primary/60 group-hover:opacity-100"></div>
        <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-all duration-300 bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-[length:200%_100%] group-hover:bg-[length:100%_100%] bg-clip-text relative">
          {article.title}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500 rounded-full"></span>
        </h2>
        {article.excerpt && (
          <p className="mb-4 leading-relaxed text-foreground/70 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="flex flex-wrap gap-4 items-center text-sm text-muted">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 group-hover:bg-primary/10 transition-colors">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(article.publishedAt || article.createTime, 'YYYY-MM-DD', locale)}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 group-hover:bg-primary/10 transition-colors">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {article.viewCount}
          </span>
          {article.categoryName && (
            <span className="px-4 py-1.5 bg-gradient-to-r from-primary/20 to-accent/20 text-primary rounded-full text-xs font-semibold border border-primary/20">{article.categoryName}</span>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

