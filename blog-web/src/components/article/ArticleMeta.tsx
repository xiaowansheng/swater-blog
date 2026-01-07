'use client';

import { formatDate } from '@/lib/utils/format';
import { usePathname, Link } from '@/lib/i18n/routing';
import type { PostVO } from '@/types';

interface ArticleMetaProps {
  article: PostVO;
}

export default function ArticleMeta({ article }: ArticleMetaProps) {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';

  return (
    <div className="flex flex-wrap gap-4 items-center pb-6 mb-8 text-sm border-b text-muted border-border/40">
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
      
      {/* 字数统计 */}
      <span className="flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {(article.content?.length || 0).toLocaleString()} 字
      </span>
      
      {/* 阅读量 */}
      <span className="flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {(article.viewCount || 0).toLocaleString()} 次阅读
      </span>

      {article.categoryName && article.categoryKey && (
        <Link
          href={`/category/${article.categoryKey}`}
          className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
        >
          {article.categoryName}
        </Link>
      )}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.tagKey}`}
              className="px-3 py-1 text-xs font-medium rounded-full transition-colors bg-secondary hover:bg-primary/10 hover:text-primary"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

