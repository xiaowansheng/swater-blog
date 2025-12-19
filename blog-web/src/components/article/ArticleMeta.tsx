'use client';

import { useTranslations } from 'next-intl';
import { formatDate } from '@/lib/utils/format';
import { usePathname } from '@/lib/i18n/routing';
import type { PostVO } from '@/types';

interface ArticleMetaProps {
  article: PostVO;
}

export default function ArticleMeta({ article }: ArticleMetaProps) {
  const t = useTranslations('common');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-8 pb-6 border-b border-border/40">
      {article.authorName && (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {article.authorName}
        </span>
      )}
      {article.publishedAt && (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(article.publishedAt, 'YYYY-MM-DD HH:mm', locale)}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {article.viewCount}
      </span>
      {article.likeCount > 0 && (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {article.likeCount}
        </span>
      )}
      {article.commentCount > 0 && (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {article.commentCount}
        </span>
      )}
      {article.categoryName && (
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
          {article.categoryName}
        </span>
      )}
      {article.tags && article.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {article.tags.map((tag) => (
            <span key={tag.id} className="px-3 py-1 bg-secondary hover:bg-primary/10 hover:text-primary rounded-full text-xs font-medium transition-colors cursor-pointer">
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

