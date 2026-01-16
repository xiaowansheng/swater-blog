import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Image from '@/components/common/ImageWithPreview';
import MomentImages from '@/components/moment/MomentImages';
import { AnimeComment } from '@/components/anime-comment';
import ContentTracker from '@/components/visitor/ContentTracker';
import MomentLiveStats from '@/components/moment/MomentLiveStats';
import ContentLikeButton from '@/components/common/ContentLikeButton';
import PageHeader from '@/components/layout/PageHeader';
import { momentApi } from '@/lib/api/moment';
import { formatDate } from '@/lib/utils/format';
import { ISR_REVALIDATE } from '@/lib/constants';
import { getAuthorInfo, getServerConfig } from '@/lib/api/config.server';

export const revalidate = ISR_REVALIDATE.HOME;

// 格式化位置信息
function formatLocation(
  country: string | undefined,
  province: string | undefined,
  city: string | undefined,
  location: string | undefined,
  ipLocation: string | undefined
): string {
  // 优先使用经纬度解析的 location
  if (location) return location;

  // 其次使用 IP 解析的 ipLocation
  if (ipLocation) return ipLocation;

  // 最后才拼接 country, province, city
  const parts = [];
  if (country && country !== '中国' && country !== 'China') {
    parts.push(country);
  }
  if (province) {
    parts.push(province);
  }
  if (city && city !== province) {
    parts.push(city);
  }
  return parts.length > 0 ? parts.join(' · ') : '';
}

// 格式化设备和浏览器信息
function formatDeviceAndBrowser(device: string | undefined, browser: string | undefined): string {
  const parts = [];
  if (device) parts.push(device);
  if (browser) parts.push(browser);
  return parts.join(' · ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; key: string }>;
}): Promise<Metadata> {
  const { key, locale } = await params;
  const t = await getTranslations('common');

  try {
    const moment = await momentApi.getByKey(key);
    const content = moment.content.replace(/<[^>]*>/g, '').substring(0, 100);
    return {
      title: `${t('moments')} - ${content}...`,
      description: content,
    };
  } catch {
    return {
      title: t('momentDetail'),
    };
  }
}

export default async function MomentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; key: string }>;
}) {
  const { key } = await params;
  const t = await getTranslations('common');

  try {
    const [moment, author, config] = await Promise.all([
      momentApi.getByKey(key),
      getAuthorInfo(),
      getServerConfig(),
    ]);
    const { privacy } = config;

    return (
      <>
        <ContentTracker contentType="TALK" contentId={moment.id} />

        <PageHeader title={t('momentDetail')} />

        <main className="container mx-auto px-4 py-12 flex-1">
          <article className="group relative bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm max-w-4xl mx-auto">
            {/* 装饰性背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-accent/[0.03] to-transparent rounded-bl-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/[0.03] to-transparent rounded-tr-full pointer-events-none"></div>

            {/* 星星装饰 */}
            <div className="absolute top-6 right-6 text-accent/20 text-sm animate-twinkle pointer-events-none">✦</div>
            <div className="absolute bottom-12 right-12 text-primary/20 text-sm animate-twinkle pointer-events-none" style={{ animationDelay: '0.5s' }}>✧</div>
            <div className="absolute top-1/2 left-6 text-accent/10 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '1s' }}>✦</div>

            {/* 内容区域 */}
            <div className="relative z-10">
              {/* 作者信息 */}
              <div className="flex items-start gap-4 mb-6">
                {author.avatar && (
                  <div className="relative flex-shrink-0" style={{ width: '80px', height: '80px' }}>
                    {/* 头像光晕 */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {/* 外圈装饰 */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10" style={{ margin: '-6px' }}></div>
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-[spin_15s_linear_infinite]" style={{ margin: '-4px' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src={author.avatar}
                        alt={author.name || t('author')}
                        width={64}
                        height={64}
                        className="rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"
                        style={{ width: '64px', height: '64px' }}
                        previewEnabled={false}
                      />
                    </div>
                  </div>
                )}
                <div className="flex-1 pt-2">
                  <div className="text-lg font-bold mb-1 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto] group-hover:animate-gradient">
                    {author.name || t('author')}
                  </div>
                  <div className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse"></span>
                    {formatDate(moment.createTime)}
                  </div>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="relative rounded-xl p-6 bg-gradient-to-br from-secondary/20 to-transparent border border-primary/5 mb-6">
                {/* 装饰星星 */}
                <div className="absolute top-2 right-2 text-primary/10 text-xs">✦</div>
                <div className="absolute bottom-2 left-2 text-accent/10 text-xs">✧</div>

                <div
                  className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline relative z-10"
                  dangerouslySetInnerHTML={{ __html: moment.content }}
                />
              </div>

              {/* 图片展示 */}
              {moment.images && moment.images.length > 0 && (
                <div className="mb-6 relative">
                  <MomentImages images={moment.images} alt={moment.content.substring(0, 20)} />
                </div>
              )}

              {/* 位置和设备信息 */}
              {(() => {
                const hasLocation = privacy.showLocation && formatLocation(moment.country, moment.province, moment.city, moment.location, moment.ipLocation);
                const hasDevice = (privacy.showDevice || privacy.showBrowser) && formatDeviceAndBrowser(
                  privacy.showDevice ? moment.device : undefined,
                  privacy.showBrowser ? moment.browser : undefined
                );

                if (!hasLocation && !hasDevice) return null;

                return (
                  <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground border-t border-border/30 relative">
                    {/* 装饰星星 */}
                    <div className="absolute top-2 left-6 text-primary/10 text-[10px]">✦</div>
                    <div className="absolute top-2 right-6 text-accent/10 text-[10px]">✧</div>

                    {/* 左边：地址 */}
                    {hasLocation && (
                      <div className="flex items-center gap-1.5 flex-1 group/location">
                        <svg className="w-3.5 h-3.5 text-primary/60 group-hover/location:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="group-hover/location:text-foreground/80 transition-colors">{formatLocation(moment.country, moment.province, moment.city, moment.location, moment.ipLocation)}</span>
                      </div>
                    )}

                    {/* 右边：设备和浏览器 */}
                    {hasDevice && (
                      <div className="flex items-center gap-1.5 flex-1 justify-end group/device">
                        <svg className="w-3.5 h-3.5 text-accent/60 group-hover/device:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="group-hover/device:text-foreground/80 transition-colors">{formatDeviceAndBrowser(
                          privacy.showDevice ? moment.device : undefined,
                          privacy.showBrowser ? moment.browser : undefined
                        )}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 统计信息 */}
              <div className="mb-8">
                <MomentLiveStats
                  id={moment.id}
                  initial={{
                    viewCount: moment.viewCount || 0,
                    likeCount: moment.likeCount || 0,
                    commentCount: moment.commentCount || 0,
                  }}
                />
              </div>

              {/* 点赞按钮 */}
              <div className="mb-8">
                <ContentLikeButton
                  contentType="TALK"
                  contentId={moment.id}
                  initialLikeCount={moment.likeCount || 0}
                />
              </div>

              {/* 评论区 */}
              <div className="pt-8 border-t border-border/50 relative">
                {/* 装饰星星 */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-primary/10 text-sm">✦</div>
                <AnimeComment momentId={moment.id} />
              </div>
            </div>
          </article>
        </main>
      </>
    );
  } catch (error) {
    console.error('Failed to load moment:', error);
    notFound();
  }
}
