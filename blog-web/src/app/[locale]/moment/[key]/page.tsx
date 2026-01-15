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
  if (country && country !== '中国') {
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
  const { key } = await params;
  try {
    const moment = await momentApi.getByKey(key);
    const content = moment.content.replace(/<[^>]*>/g, '').substring(0, 100);
    return {
      title: `说说 - ${content}...`,
      description: content,
    };
  } catch {
    return {
      title: '说说详情',
    };
  }
}

export default async function MomentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; key: string }>;
}) {
  const { key } = await params;
  await getTranslations('common');

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

        <PageHeader
          title="说说详情"
          description={moment.content.replace(/<[^>]*>/g, '').substring(0, 100)}
        />

        <main className="container mx-auto px-4 py-12 flex-1">
          <article className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-start gap-3 mb-6">
              {author.avatar && (
                <Image
                  src={author.avatar}
                  alt={author.name || '作者'}
                  width={48}
                  height={48}
                  className="rounded-full flex-shrink-0"
                  previewEnabled={false}
                />
              )}
              <div className="flex-1">
                <div className="text-lg font-medium mb-1">{author.name || '博主'}</div>
                <div className="text-xs text-muted-foreground/70">{formatDate(moment.createTime)}</div>
              </div>
            </div>

            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: moment.content }}
            />

            {moment.images && moment.images.length > 0 && (
              <MomentImages images={moment.images} alt={moment.content.substring(0, 20)} />
            )}

            {/* 位置和设备信息 */}
            {(privacy.showLocation || privacy.showDevice || privacy.showBrowser) &&
             (moment.location || moment.ipLocation || moment.country || moment.province || moment.city || moment.device || moment.browser) && (
              <div className="flex items-center justify-between mt-6 pt-4 text-xs text-muted-foreground border-t border-border/50">
                {/* 左边：地址 */}
                <div className="flex items-center gap-1 flex-1">
                  {privacy.showLocation && formatLocation(moment.country, moment.province, moment.city, moment.location, moment.ipLocation) && (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{formatLocation(moment.country, moment.province, moment.city, moment.location, moment.ipLocation)}</span>
                    </>
                  )}
                </div>

                {/* 右边：设备和浏览器 */}
                <div className="flex items-center gap-1 flex-1 justify-end">
                  {(privacy.showDevice || privacy.showBrowser) && formatDeviceAndBrowser(
                    privacy.showDevice ? moment.device : undefined,
                    privacy.showBrowser ? moment.browser : undefined
                  ) && (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDeviceAndBrowser(
                        privacy.showDevice ? moment.device : undefined,
                        privacy.showBrowser ? moment.browser : undefined
                      )}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            <ContentLikeButton
              contentType="TALK"
              contentId={moment.id}
              initialLikeCount={moment.likeCount || 0}
            />

            <MomentLiveStats
              id={moment.id}
              initial={{
                viewCount: moment.viewCount || 0,
                likeCount: moment.likeCount || 0,
                commentCount: moment.commentCount || 0,
              }}
            />

            <div className="mt-12">
              <AnimeComment momentId={moment.id} />
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
