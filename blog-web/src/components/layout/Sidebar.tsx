import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import type { CategoryVO, TagVO, PostVO } from '@/types';

interface SidebarProps {
  categories?: CategoryVO[];
  tags?: TagVO[];
  hotArticles?: PostVO[];
}

export default async function Sidebar({ categories = [], tags = [], hotArticles = [] }: SidebarProps) {
  const t = await getTranslations('common');

  return (
    <aside className="w-full md:w-64 space-y-6">
      {categories.length > 0 && (
        <div className="modern-card p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30"></div>
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-accent to-transparent opacity-20"></div>
          <h3 className="font-bold mb-5 text-lg flex items-center gap-2.5 relative">
            <span className="p-2 rounded-lg bg-gradient-to-br from-primary/25 to-accent/25 shadow-sm shadow-primary/20">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </span>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{t('categories')}</span>
          </h3>
          <ul className="space-y-1.5">
            {categories.slice(0, 10).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.id}`}
                  className="flex items-center justify-between text-foreground/70 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 rounded-lg px-3 py-2.5 transition-all group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="group-hover:translate-x-1 transition-transform">{category.name}</span>
                  </span>
                  {category.articleCount !== undefined && (
                    <span className="relative z-10 text-xs bg-gradient-to-r from-primary/10 to-accent/10 px-2.5 py-1 rounded-full group-hover:from-primary/20 group-hover:to-accent/20 transition-all font-semibold">
                      {category.articleCount}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div className="modern-card p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30"></div>
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-accent to-transparent opacity-20"></div>
          <h3 className="font-bold mb-5 text-lg flex items-center gap-2.5 relative">
            <span className="p-2 rounded-lg bg-gradient-to-br from-primary/25 to-accent/25 shadow-sm shadow-primary/20">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </span>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{t('tags')}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 20).map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className="px-3.5 py-1.5 text-sm bg-gradient-to-r from-secondary to-secondary hover:from-primary hover:to-accent hover:text-white rounded-full transition-all hover:scale-110 active:scale-95 font-medium shadow-sm hover:shadow-md relative overflow-hidden group"
              >
                <span className="relative z-10">{tag.name}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {hotArticles.length > 0 && (
        <div className="modern-card p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30"></div>
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-accent to-transparent opacity-20"></div>
          <h3 className="font-bold mb-5 text-lg flex items-center gap-2.5 relative">
            <span className="p-2 rounded-lg bg-gradient-to-br from-primary/25 to-accent/25 shadow-sm shadow-primary/20">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">热门文章</span>
          </h3>
          <ul className="space-y-3">
            {hotArticles.map((article, index) => (
              <li key={article.id} className="flex items-start gap-3 group">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-primary/25 to-accent/25 text-primary text-xs font-bold flex items-center justify-center mt-0.5 shadow-sm shadow-primary/20 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/30 transition-all">
                  {index + 1}
                </span>
                <Link
                  href={`/post/${article.slug}`}
                  className="text-sm text-foreground/70 hover:text-primary hover:underline line-clamp-2 flex-1 transition-all group-hover:translate-x-1"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

    </aside>
  );
}

