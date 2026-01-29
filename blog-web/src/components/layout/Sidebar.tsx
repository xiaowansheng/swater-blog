import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import type { CategoryVO, TagVO, PostVO } from '@/types';
import { getAuthorInfo } from '@/lib/api/config.server';
import { getFullUrl } from '@/lib/utils/format';
import Image from 'next/image';

interface SidebarProps {
  categories?: CategoryVO[];
  tags?: TagVO[];
  hotArticles?: PostVO[];
}

export default async function Sidebar({ categories = [], tags = [], hotArticles = [] }: SidebarProps) {
  const t = await getTranslations('common');
  const author = await getAuthorInfo();

  return (
    <aside className="w-full lg:w-64 space-y-4 sm:space-y-6">
      {/* 作者信息卡片 */}
      {(author.name || author.avatar) && (
        <div className="modern-card p-4 sm:p-5 relative overflow-hidden">
          {/* 装饰性背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-xl"></div>

          {/* 星星装饰 */}
          <div className="absolute top-3 right-3 text-primary/40 text-xs animate-twinkle">✦</div>
          <div className="absolute top-12 right-8 text-accent/30 text-xs animate-twinkle" style={{ animationDelay: '0.5s' }}>✧</div>
          <div className="absolute bottom-8 left-4 text-primary/30 text-xs animate-twinkle" style={{ animationDelay: '1s' }}>✦</div>

          <div className="flex flex-col items-center text-center space-y-3 relative z-10">
            {/* 头像 */}
            {author.avatar && (
              <div className="relative group">
                {/* 头像光晕效果 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>

                {/* 头像边框装饰 */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                  {/* 外圈装饰 */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-[spin_10s_linear_infinite]"></div>
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-sm"></div>

                  {/* 头像容器 */}
                  <div className="relative w-full h-full rounded-full overflow-hidden ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all duration-300 bg-gradient-to-br from-card to-secondary">
                    <Image
                      src={getFullUrl(author.avatar)}
                      alt={author.name || 'Author'}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* 装饰性小星星 */}
                  <div className="absolute -top-1 -right-1 text-accent text-sm animate-bounce-soft">✦</div>
                </div>
              </div>
            )}

            {/* 昵称和签名 */}
            <div className="space-y-2 w-full relative">
              {/* 昵称 */}
              {author.name && (
                <div className="relative inline-block">
                  <h3 className="font-bold text-base sm:text-lg bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient relative z-10">
                    {author.name}
                  </h3>
                  {/* 文字下划线装饰 */}
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                </div>
              )}

              {/* 签名 */}
              {author.signature && (
                <div className="relative">
                  <p className="text-xs sm:text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed px-3 py-2 bg-secondary/30 rounded-xl backdrop-blur-sm border border-primary/10">
                    {author.signature}
                  </p>
                  {/* 签名框装饰 */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-accent/40 rounded-tr-sm"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-primary/40 rounded-bl-sm"></div>
                </div>
              )}
            </div>
          </div>

          {/* 底部装饰线 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="modern-card p-4 sm:p-5 relative overflow-hidden">
          {/* 装饰背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
          <div className="absolute top-2 right-2 w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl"></div>

          {/* 标题装饰 */}
          <div className="relative z-10">
            <h3 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
              <span className="relative">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* 图标光晕 */}
                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full"></div>
              </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('categories')}</span>
            </h3>
          </div>

          {/* 列表内容 */}
          <ul className="space-y-1 sm:space-y-1.5 relative z-10">
            {categories.slice(0, 10).map((category, index) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.categoryKey}`}
                  className="flex items-center justify-between text-foreground/70 hover:text-primary rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 transition-all group relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* 悬停背景效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>

                  <span className="flex items-center gap-2 relative z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></span>
                    <span className="text-sm sm:text-base group-hover:translate-x-1 transition-transform duration-300">{category.name}</span>
                  </span>
                  {category.articleCount !== undefined && (
                    <span className="relative z-10 text-xs bg-gradient-to-r from-primary/10 to-accent/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full group-hover:from-primary/20 group-hover:to-accent/20 transition-all font-semibold border border-primary/10">
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
        <div className="modern-card p-4 sm:p-5 relative overflow-hidden">
          {/* 装饰背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-xl"></div>

          {/* 标题装饰 */}
          <div className="relative z-10">
            <h3 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
              <span className="relative">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div className="absolute inset-0 bg-accent/20 blur-md rounded-full"></div>
              </span>
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">{t('tags')}</span>
            </h3>
          </div>

          {/* 标签云 */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 relative z-10">
            {tags.slice(0, 20).map((tag, index) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className="group relative px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full transition-all duration-300 font-medium inline-flex items-center !min-h-0 !min-w-0 !h-auto !w-auto"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* 渐变背景 */}
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary rounded-full transition-all duration-300 group-hover:from-primary group-hover:to-accent group-hover:scale-105"></div>
                {/* 光泽效果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 text-foreground group-hover:text-white transition-colors duration-300">{tag.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {hotArticles.length > 0 && (
        <div className="modern-card p-4 sm:p-5 relative overflow-hidden">
          {/* 装饰背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5"></div>
          <div className="absolute top-2 left-2 w-12 h-12 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-xl"></div>

          {/* 标题装饰 */}
          <div className="relative z-10">
            <h3 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
              <span className="relative">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="absolute inset-0 bg-accent/20 blur-md rounded-full animate-pulse"></div>
              </span>
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">{t('hotArticles')}</span>
            </h3>
          </div>

          {/* 热门文章列表 */}
          <ul className="space-y-2 sm:space-y-2.5 relative z-10">
            {hotArticles.map((article, index) => (
              <li key={article.id} className="flex items-center gap-2 sm:gap-3 group relative">
                {/* 悬停背景 */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mx-2 -my-1"></div>

                {/* 排名徽章 */}
                <span className="relative flex-shrink-0 w-6 h-6 sm:w-6 sm:h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: index < 3
                      ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, rgb(var(--primary) / 0.1) 0%, rgb(var(--accent) / 0.1) 100%)',
                    color: index < 3 ? '#fff' : 'rgb(var(--primary))'
                  }}
                >
                  {index + 1}
                  {/* 前三名额外装饰 */}
                  {index < 3 && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-300/50 to-amber-400/50 animate-pulse"></div>
                  )}
                </span>
                <Link
                  href={`/post/${article.articleKey}`}
                  className="relative z-10 text-xs sm:text-sm text-foreground/70 hover:text-primary line-clamp-2 flex-1 transition-all duration-300 group-hover:translate-x-1 flex items-center"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {categories.length === 0 && tags.length === 0 && hotArticles.length === 0 && (
        <div className="modern-card p-6 sm:p-8 relative overflow-hidden">
          {/* 装饰背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>

          <div className="flex flex-col items-center justify-center text-center py-6 sm:py-8 space-y-3 relative z-10">
            {/* 图标容器 */}
            <div className="relative">
              {/* 图标光晕 */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 blur-lg animate-pulse"></div>
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                {/* 装饰星星 */}
                <div className="absolute -top-1 -right-1 text-accent/40 text-xs animate-twinkle">✦</div>
              </div>
            </div>

            {/* 提示文字 */}
            <div className="space-y-1">
              <p className="text-sm sm:text-base font-medium bg-gradient-to-r from-foreground/70 to-foreground/50 bg-clip-text text-transparent">{t('noContent')}</p>
              <p className="text-xs sm:text-sm text-foreground/50">{t('noContentHint')}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

