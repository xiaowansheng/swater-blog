'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from '@/components/common/ImageWithPreview';
import type { MomentVO } from '@/types';
import { formatDate, getFullUrl } from '@/lib/utils/format';
import ImagePreview from '@/components/ImagePreview';
import { useSiteConfig } from '@/lib/context/SiteConfigContext';
import { Card } from '@/components/ui/Card';
import { UAList } from '@/components/common/UAIcon';

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

function formatIp(ip: string | undefined): string {
  if (!ip) return '';
  return `IP: ${ip}`;
}
interface MomentItemProps {
  moment: MomentVO;
}

const MAX_HEIGHT = 250;
const MAX_ROWS = 2;
const GAP = 8;
const MIN_IMAGE_WIDTH = 100;
const MAX_IMAGE_WIDTH = 300;

export default function MomentItem({ moment }: MomentItemProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const { author, privacy } = useSiteConfig();
  const contentRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [shouldTruncate, setShouldTruncate] = useState(false);
  const [imagesPerRow, setImagesPerRow] = useState(3);
  const [displayCount, setDisplayCount] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const pinnedText = t('pinned');

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setShouldTruncate(height > MAX_HEIGHT);
    }
  }, [moment.content]);

  useEffect(() => {
    if (!moment.images || moment.images.length === 0) return;

    const calculateDisplay = () => {
      if (!imageContainerRef.current || !moment.images) return;
      
      const containerWidth = imageContainerRef.current.offsetWidth;
      
      const maxCols = Math.floor((containerWidth + GAP) / (MIN_IMAGE_WIDTH + GAP));
      const minCols = Math.ceil((containerWidth + GAP) / (MAX_IMAGE_WIDTH + GAP));
      
      const perRow = Math.max(1, Math.min(maxCols, Math.max(minCols, 1)));
      
      setImagesPerRow(perRow);
      
      const totalImages = moment.images.length;
      const maxDisplay = perRow * MAX_ROWS;
      const display = totalImages > maxDisplay ? maxDisplay - 1 : totalImages;
      
      setDisplayCount(display);
    };

    calculateDisplay();
    const resizeObserver = new ResizeObserver(calculateDisplay);
    if (imageContainerRef.current) {
      resizeObserver.observe(imageContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [moment.images]);

  const handleContentClick = () => {
    router.push(`/moment/${moment.talkKey}`);
  };

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const totalImages = moment.images?.length || 0;
  const fullUrlImages = moment.images?.map(img => getFullUrl(img)) || [];
  const showMore = totalImages > displayCount;
  const displayImages = fullUrlImages.slice(0, displayCount);

  return (
    <Card className="p-6 relative overflow-hidden group">
      {/* 置顶标识 - 右上角 */}
      {!!moment.isTop && (
        <div className="absolute top-4 right-4 z-30 pointer-events-none">
          <span className="relative inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-500/30">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2l-2-2z" />
            </svg>
            {pinnedText}
          </span>
        </div>
      )}

      {/* 装饰性背景 - kept for specific moment style if needed, or rely on Card's default. Card implies simple background. I will keep specific decorators for consistency with previous design if they are distinct. */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/[0.03] to-transparent rounded-bl-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/[0.03] to-transparent rounded-tr-full pointer-events-none"></div>

      {/* 星星装饰 */}
      <div className="absolute top-4 left-4 text-accent/20 text-xs animate-twinkle pointer-events-none">✦</div>
      <div className="absolute bottom-8 right-8 text-primary/20 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '0.5s' }}>✧</div>

      {/* 内容区域 */}
      <div className="relative z-10">
        {/* 作者信息 */}
        <div className="flex items-start gap-3 mb-4">
          {author.avatar && (
            <div className="relative shrink-0">
              {/* 头像光晕 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                {/* 外圈装饰 */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10"></div>
                <Image
                  src={author.avatar}
                  alt={author.name || '作者'}
                  width={48}
                  height={48}
                  className="relative w-full h-full rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"
                  previewEnabled={false}
                />
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold mb-1 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">{author.name || '博主'}</div>
            <div className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse"></span>
              {formatDate(moment.createTime)}
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div
          ref={contentRef}
          className="relative overflow-hidden prose-sm prose cursor-pointer max-w-none dark:prose-invert mb-4 rounded-xl p-4 bg-gradient-to-br from-secondary/20 to-transparent border border-primary/5 hover:border-primary/10 transition-all duration-300"
          style={shouldTruncate ? {
            maxHeight: `${MAX_HEIGHT}px`,
            maskImage: 'linear-gradient(to bottom, black calc(100% - 20px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 20px), transparent 100%)'
          } : {}}
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: moment.content }}
        />

        {/* 图片网格 */}
        {moment.images && moment.images.length > 0 && (
          <div
            ref={imageContainerRef}
            className="grid gap-2 mb-4 relative"
            style={{ gridTemplateColumns: `repeat(${imagesPerRow}, 1fr)` }}
          >
            {displayImages.map((img, idx) => (
              <div
                key={idx}
                className="group/img relative overflow-hidden rounded-xl cursor-pointer aspect-video bg-gradient-to-br from-muted/50 to-muted/30 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                style={{
                  minWidth: `${MIN_IMAGE_WIDTH}px`,
                  maxWidth: `${MAX_IMAGE_WIDTH}px`
                }}
                onClick={(e) => handleImageClick(e, idx)}
              >
                {/* 图片悬停效果 */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500"></div>
                <Image
                  src={img}
                  alt={`${moment.content.substring(0, 20)}...`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/img:scale-110"
                  loading="lazy"
                  previewEnabled={false}
                />
              </div>
            ))}
            {showMore && (
              <div
                className="relative flex items-center justify-center overflow-hidden transition-all duration-300 border-2 border-dashed rounded-xl cursor-pointer aspect-video bg-gradient-to-br from-secondary/30 to-secondary/20 border-primary/20 hover:border-primary/40 hover:shadow-lg group/more"
                style={{
                  minWidth: `${MIN_IMAGE_WIDTH}px`,
                  maxWidth: `${MAX_IMAGE_WIDTH}px`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleContentClick();
                }}
              >
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover/more:opacity-100 transition-opacity duration-300"></div>
                <div className="text-center relative z-10">
                  <div className="mb-1 text-2xl animate-bounce-soft">📷</div>
                  <div className="text-sm font-medium text-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    还有 {totalImages - displayCount} 张
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 统计信息 */}
        <div className="flex items-center gap-4 sm:gap-6 pt-4 pb-2 text-sm border-t border-border/50 text-muted-foreground relative">
          {/* 底部装饰线 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

          <div className="flex items-center gap-1.5 group/stat">
            <svg className="w-4 h-4 text-primary/60 group-hover/stat:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="group-hover/stat:text-foreground/80 transition-colors">{moment.viewCount || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 group/stat">
            <svg className="w-4 h-4 text-red-500/70 group-hover/stat:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="group-hover/stat:text-foreground/80 transition-colors">{moment.likeCount || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 group/stat">
            <svg className="w-4 h-4 text-accent/60 group-hover/stat:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="group-hover/stat:text-foreground/80 transition-colors">{moment.commentCount || 0}</span>
          </div>
        </div>

        {/* 位置和设备信息 */}
                {(() => {
          const locationText = privacy.showLocation
            ? formatLocation(moment.country, moment.province, moment.city, moment.location, moment.ipLocation)
            : '';
          const ipText = privacy.showIp ? formatIp(moment.ip) : '';
          const hasMeta = Boolean(locationText || ipText)
            || ((privacy.showDevice || privacy.showBrowser) && (moment.device || moment.browser));

          if (!hasMeta) return null;

          return (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 text-xs text-muted-foreground border-t border-border/30 relative">
            {/* Decorations */}
            <div className="absolute top-2 left-4 text-primary/10 text-[10px]">*</div>
            <div className="absolute top-2 right-4 text-accent/10 text-[10px]">*</div>

            {locationText && (
              <span className="flex items-center gap-1 min-w-0 group/location">
                <svg className="w-3.5 h-3.5 text-primary/60 group-hover/location:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="group-hover/location:text-foreground/80 transition-colors truncate max-w-[14rem] sm:max-w-none">{locationText}</span>
              </span>
            )}
            {ipText && (
              <span className="flex items-center gap-1 min-w-0 group/ip">
                <svg className="w-3.5 h-3.5 text-primary/60 group-hover/ip:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  <circle cx="12" cy="12" r="3" strokeWidth={2} />
                </svg>
                <span className="truncate max-w-[10rem] sm:max-w-none">{ipText}</span>
              </span>
            )}
            {(privacy.showDevice || privacy.showBrowser) && (moment.device || moment.browser) && (
              <UAList 
                device={privacy.showDevice ? moment.device : undefined} 
                browser={privacy.showBrowser ? moment.browser : undefined}
              />
            )}
          </div>
          );
        })()}
      </div>

      {fullUrlImages.length > 0 && (
        <ImagePreview
          images={fullUrlImages}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          initialIndex={previewIndex}
        />
      )}
    </Card>
  );
}

