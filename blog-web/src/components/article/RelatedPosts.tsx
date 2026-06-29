'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import type { PostVO } from '@/types';

interface RelatedPostsProps {
  articles: PostVO[];
  locale: string;
}

export default function RelatedPosts({ articles, locale }: RelatedPostsProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        相关推荐
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/${locale}/post/${article.articleKey || article.slug || article.id}`}
            className="block group"
          >
            <Card hoverEffect className="h-full border border-border/50 transition-all duration-200">
              <div className="p-4">
                {article.cover && (
                  <div className="mb-3 overflow-hidden rounded-lg aspect-video bg-muted relative">
                    <Image
                      src={article.cover}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors flex items-center gap-1">
                  {article.hasPassword && (
                    <svg className="w-3.5 h-3.5 text-primary/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Encrypted">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                  {article.title}
                </h4>
                {article.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {article.categoryName && (
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-medium">
                      {article.categoryName}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {article.viewCount || 0}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
