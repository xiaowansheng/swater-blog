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
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4">{t('categories')}</h3>
          <ul className="space-y-2">
            {categories.slice(0, 10).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.id}`}
                  className="text-foreground/70 hover:text-foreground hover:underline"
                >
                  {category.name}
                  {category.articleCount !== undefined && (
                    <span className="ml-2 text-sm">({category.articleCount})</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4">{t('tags')}</h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 20).map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className="px-2 py-1 text-sm bg-secondary rounded hover:bg-secondary/80"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {hotArticles.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-4">热门文章</h3>
          <ul className="space-y-2">
            {hotArticles.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/post/${article.slug}`}
                  className="text-sm text-foreground/70 hover:text-foreground hover:underline line-clamp-2"
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

