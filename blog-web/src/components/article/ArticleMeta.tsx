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
    <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70 mb-8">
      {article.authorName && (
        <span>
          {t('author')}: {article.authorName}
        </span>
      )}
      {article.publishedAt && (
        <span>
          {t('publishedAt')}: {formatDate(article.publishedAt, 'YYYY-MM-DD HH:mm', locale)}
        </span>
      )}
      <span>
        {t('viewCount')}: {article.viewCount}
      </span>
      {article.likeCount > 0 && (
        <span>
          {t('likeCount')}: {article.likeCount}
        </span>
      )}
      {article.commentCount > 0 && (
        <span>
          {t('commentCount')}: {article.commentCount}
        </span>
      )}
      {article.categoryName && (
        <span className="px-2 py-1 bg-primary/10 rounded">
          {article.categoryName}
        </span>
      )}
      {article.tags && article.tags.length > 0 && (
        <div className="flex gap-2">
          {article.tags.map((tag) => (
            <span key={tag.id} className="px-2 py-1 bg-secondary rounded">
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

