'use client';

import { useTranslations } from 'next-intl';
import { formatDate } from '@/lib/utils/format';
import { usePathname } from '@/lib/i18n/routing';
import type { PostVO, AuthorInfo } from '@/types';
import { useCopyToClipboard } from '@/lib/hooks/useCopyToClipboard';

interface ArticleCopyrightProps {
  article: PostVO;
  author?: AuthorInfo;
}

export default function ArticleCopyright({ article, author }: ArticleCopyrightProps) {
  const t = useTranslations('article');
  const tc = useTranslations('common');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const articleUrl = typeof window !== 'undefined' ? window.location.origin + pathname : '';
  const authorName = author?.name || article.authorName || tc('authorName');

  const handleCopyLink = async () => {
    await copyToClipboard(articleUrl);
  };

  return (
    <div className="mt-12 border-t border-border/40 pt-8">
      <div className="bg-muted/30 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('copyright')}
        </div>

        <div className="space-y-3 text-sm">
          {/* 作者和许可证 */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-muted-foreground">
              {t('copyrightNotice', { author: authorName })}{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/deed.zh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {t('license')}
              </a>
            </span>
          </div>

          {/* 文章链接 */}
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <div className="flex-1">
              <span className="text-muted-foreground">{t('articleLink')}:</span>
              <div className="mt-1">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 w-full p-2 bg-secondary rounded text-xs hover:bg-secondary/80 transition-colors group"
                  title={isCopied ? tc('copied') : tc('clickToCopy')}
                >
                  <span className="flex-1 text-left truncate text-muted-foreground">
                    {articleUrl}
                  </span>
                  {isCopied ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {tc('copied')}
                    </span>
                  ) : (
                    <svg className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 更新时间 */}
          {article.updateTime && article.updateTime !== article.publishedAt && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-muted-foreground">
                {t('lastUpdated')}: {formatDate(article.updateTime, 'YYYY-MM-DD HH:mm', locale)}
              </span>
            </div>
          )}

          {/* 发布时间 */}
          {article.publishedAt && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-muted-foreground">
                {tc('publishTime')}: {formatDate(article.publishedAt, 'YYYY-MM-DD HH:mm', locale)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
