'use client';

import { motion } from 'framer-motion';
import { usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { formatDate, stripMarkdown } from '@/lib/utils/format';
import type { PostVO } from '@/types';
import Image from '@/components/common/ImageWithPreview';
import LoadingLink from '@/components/common/LoadingLink';

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
      className={`overflow-hidden group modern-card flex flex-col relative ${showCover ? 'md:flex-row' : ''}`}
    >
      {/* 装饰性背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/[0.05] to-transparent rounded-bl-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/[0.05] to-transparent rounded-tr-full pointer-events-none"></div>

      {/* 星星装饰 */}
      <div className="absolute top-4 right-4 text-primary/20 text-xs animate-twinkle pointer-events-none">✦</div>
      <div className="absolute bottom-6 right-8 text-accent/20 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '0.5s' }}>✧</div>

      {showCover && (
        <LoadingLink href={`/post/${article.articleKey}`} className="md:w-[40%] lg:w-[35%] shrink-0 relative">
          <div className="overflow-hidden relative h-48 sm:h-56 md:h-full min-h-[240px]">
            <Image
              src={article.cover!}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              previewEnabled={false}
            />
            {/* 多层渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* 装饰性光晕 */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          </div>
        </LoadingLink>
      )}

      <div className="flex-1 p-3 sm:p-4 md:p-5 flex flex-col min-w-0 relative z-10">
        <div className="flex-1 flex flex-col">
          <LoadingLink href={`/post/${article.articleKey}`}>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 font-title leading-tight text-center truncate group-relative">
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto] group-hover:animate-gradient transition-all duration-300">
                  {article.title}
                </span>
                {/* 标题下划线装饰 */}
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </span>
            </h2>
          </LoadingLink>

          {/* 统计信息 */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60 mb-3">
            <span className="flex items-center gap-1.5 group/stat">
              <svg className="w-3.5 h-3.5 text-primary/60 group-hover/stat:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="group-hover/stat:text-foreground/80 transition-colors">
                {article.publishedAt ? t('updatedAtShort') : t('publishedAtShort')} {formatDate(article.publishedAt || article.createTime, 'YYYY-MM-DD', locale)}
              </span>
            </span>
            <span className="flex items-center gap-1.5 group/stat">
              <svg className="w-3.5 h-3.5 text-primary/60 group-hover/stat:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="group-hover/stat:text-foreground/80 transition-colors">{article.viewCount}</span>
            </span>
            <span className="flex items-center gap-1.5 group/stat">
              <svg className="w-3.5 h-3.5 text-accent/70 group-hover/stat:text-accent transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="group-hover/stat:text-foreground/80 transition-colors">{article.likeCount}</span>
            </span>
            <span className="flex items-center gap-1.5 group/stat">
              <svg className="w-3.5 h-3.5 text-primary/60 group-hover/stat:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8m-8 4h6m-9 7l-3 3V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H9l-4 4z" />
              </svg>
              <span className="group-hover/stat:text-foreground/80 transition-colors">{article.commentCount}</span>
            </span>
          </div>

          {/* 摘要 */}
          <p className="leading-relaxed text-foreground/70 line-clamp-3 text-sm sm:text-base mb-4 relative">
            {stripMarkdown(article.excerpt || article.content)}
          </p>

          {/* 标签区域 */}
          <div className="flex flex-wrap items-center gap-2">
            {article.categoryName && article.categoryKey && (
              <LoadingLink href={`/category/${article.categoryKey}`}>
                <span className="group/tag relative inline-block px-2.5 py-1 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-full text-xs font-bold border border-primary/20 overflow-hidden">
                  <span className="relative z-10">{article.categoryName}</span>
                  {/* 标签背景光效 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover/tag:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/tag:opacity-100 transition-opacity duration-300"></div>
                </span>
              </LoadingLink>
            )}
            {article.tags && article.tags.length > 0 && (
              article.tags.map((tag, index) => (
                <LoadingLink
                  key={tag.id}
                  href={`/tag/${tag.tagKey}`}
                  className="group/tag relative inline-block text-xs px-2 py-0.5 rounded-md bg-gradient-to-r from-secondary/40 to-secondary/30 text-muted-foreground hover:text-white border border-transparent transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="relative z-10">#{tag.name}</span>
                  {/* 标签背景 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover/tag:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/tag:opacity-100 transition-opacity duration-300"></div>
                </LoadingLink>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.article>
  );
}

