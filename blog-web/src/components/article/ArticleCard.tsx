'use client';

import { motion } from 'framer-motion';
import { Link, usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { formatDate, stripMarkdown } from '@/lib/utils/format';
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
  const showCover = cardVariant === 'card' && article.cover;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`overflow-hidden group modern-card flex flex-col ${showCover ? 'md:flex-row' : ''}`}
    >
      {showCover && (
        <Link href={`/post/${article.articleKey}`} className="md:w-[40%] lg:w-[35%] shrink-0">
          <div className="overflow-hidden relative h-48 sm:h-56 md:h-full min-h-[240px]">
            <Image
              src={article.cover!}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              previewEnabled={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-500 from-black/60 via-black/20 group-hover:opacity-100"></div>
          </div>
        </Link>
      )}
      
      <div className="flex-1 p-5 sm:p-6 md:p-8 flex flex-col min-w-0">
        <div className="flex-1">
          <Link href={`/post/${article.articleKey}`}>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-primary transition-all duration-300 font-title leading-tight">
              {article.title}
            </h2>
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {article.categoryName && (
              <Link href={`/category/${article.categoryId}`}>
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20 hover:bg-primary hover:text-white transition-colors">
                  {article.categoryName}
                </span>
              </Link>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(article.publishedAt || article.createTime, 'YYYY-MM-DD', locale)}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.viewCount}
              </span>
            </div>
          </div>

          <p className="mb-6 leading-relaxed text-foreground/70 line-clamp-3 md:line-clamp-4 text-sm sm:text-base">
            {stripMarkdown(article.excerpt || article.content)}
          </p>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/40">
            {article.tags.map((tag) => (
              <Link 
                key={tag.id} 
                href={`/tag/${tag.id}`}
                className="text-xs px-2.5 py-1 rounded-md bg-secondary/40 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 border border-transparent hover:border-primary/20"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

