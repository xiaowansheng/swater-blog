import { formatDate } from '@/lib/utils/format';
import type { PostVO, AuthorInfo } from '@/types';

interface ArticleHeaderProps {
  article: PostVO;
  author?: AuthorInfo;
  locale: string;
}

export default function ArticleHeader({ article, author, locale }: ArticleHeaderProps) {
  return (
    <section className="relative flex overflow-hidden justify-center items-center min-h-[50vh] max-h-[600px]">
      {/* 背景渐变 */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b to-transparent pointer-events-none from-black/15 via-black/5 dark:from-black/30 dark:via-black/10"></div>
      
      {/* 动态背景元素 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-primary/20"></div>
        <div className="absolute right-1/4 bottom-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-accent/20 [animation-delay:1s]"></div>
      </div>

      {/* 内容 */}
      <div className="flex relative z-10 justify-center items-center px-4 w-full">
        <div className="mx-auto w-full max-w-4xl text-center space-y-6">
          {/* 文章标题 */}
          <h1 className="text-4xl md:text-6xl font-bold gradient-text leading-tight">
            {article.title}
          </h1>

          {/* 文章摘要 */}
          {article.excerpt && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* 文章元信息 */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {/* 作者 */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-medium">{author?.name || article.authorName || '作者'}</span>
            </div>

            {/* 发布时间 */}
            {article.publishedAt && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>{formatDate(article.publishedAt, 'YYYY年MM月DD日', locale)}</span>
              </div>
            )}

            {/* 分类 */}
            {article.categoryName && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span>{article.categoryName}</span>
              </div>
            )}

            {/* 阅读量 */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span>{article.viewCount || 0} 次阅读</span>
            </div>
          </div>

          {/* 标签 */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}