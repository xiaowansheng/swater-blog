'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/components/common/ImageWithPreview';
import type { MomentVO } from '@/types';
import { formatDate, getFullUrl } from '@/lib/utils/format';
import ImagePreview from '@/components/ImagePreview';
import { useSiteConfig } from '@/lib/context/SiteConfigContext';

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

interface MomentItemProps {
  moment: MomentVO;
}

const MAX_HEIGHT = 250;
const MAX_ROWS = 2;
const GAP = 8;
const MIN_IMAGE_WIDTH = 100;
const MAX_IMAGE_WIDTH = 300;

export default function MomentItem({ moment }: MomentItemProps) {
  const router = useRouter();
  const { author } = useSiteConfig();
  const contentRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [shouldTruncate, setShouldTruncate] = useState(false);
  const [imagesPerRow, setImagesPerRow] = useState(3);
  const [displayCount, setDisplayCount] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

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
    <article
      className="p-6 transition-all border rounded-2xl bg-card border-border hover:shadow-lg"
    >
      <div className="flex items-start gap-3 mb-4">
        {author.avatar && (
          <Image
            src={author.avatar}
            alt={author.name || '作者'}
            width={40}
            height={40}
            className="rounded-full shrink-0"
            previewEnabled={false}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium mb-1">{author.name || '博主'}</div>
          <div className="text-xs text-muted-foreground/70">
            {formatDate(moment.createTime)}
          </div>
        </div>
      </div>

      <div
        ref={contentRef}
        className="relative overflow-hidden prose-sm prose cursor-pointer max-w-none dark:prose-invert mb-4"
        style={shouldTruncate ? {
          maxHeight: `${MAX_HEIGHT}px`,
          maskImage: 'linear-gradient(to bottom, black calc(100% - 20px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 20px), transparent 100%)'
        } : {}}
        onClick={handleContentClick}
        dangerouslySetInnerHTML={{ __html: moment.content }}
      />

      {moment.images && moment.images.length > 0 && (
        <div 
          ref={imageContainerRef}
          className="grid gap-2 mb-4"
          style={{ gridTemplateColumns: `repeat(${imagesPerRow}, 1fr)` }}
        >
          {displayImages.map((img, idx) => (
            <div 
              key={idx} 
              className="relative overflow-hidden rounded-lg cursor-pointer aspect-video bg-muted hover:opacity-90"
              style={{
                minWidth: `${MIN_IMAGE_WIDTH}px`,
                maxWidth: `${MAX_IMAGE_WIDTH}px`
              }}
              onClick={(e) => handleImageClick(e, idx)}
            >
              <Image
                src={img}
                alt={`${moment.content.substring(0, 20)}...`}
                fill
                className="object-cover"
                loading="lazy"
                previewEnabled={false}
              />
            </div>
          ))}
          {showMore && (
            <div 
              className="relative flex items-center justify-center overflow-hidden transition-colors border-2 border-dashed rounded-lg cursor-pointer aspect-video bg-muted/50 border-muted-foreground/30 hover:bg-muted/70"
              style={{
                minWidth: `${MIN_IMAGE_WIDTH}px`,
                maxWidth: `${MAX_IMAGE_WIDTH}px`
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleContentClick();
              }}
            >
              <div className="text-center">
                <div className="mb-1 text-2xl">📷</div>
                <div className="text-sm font-medium text-muted-foreground">
                  还有 {totalImages - displayCount} 张
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 text-sm border-t border-border text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>👀</span>
          <span>{moment.viewCount || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>❤️</span>
          <span>{moment.likeCount || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💬</span>
          <span>{moment.commentCount || 0}</span>
        </div>
      </div>

      {/* 位置和设备信息 */}
      {(moment.location || moment.ipLocation || moment.country || moment.province || moment.city || moment.device || moment.browser) && (
        <div className="flex items-center justify-between mt-3 pt-3 text-xs text-muted-foreground border-t border-border/50">
          {/* 左边：地址 */}
          <div className="flex items-center gap-1 flex-1">
            {formatLocation(moment.country, moment.province, moment.city, moment.location, moment.ipLocation) && (
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
            {formatDeviceAndBrowser(moment.device, moment.browser) && (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{formatDeviceAndBrowser(moment.device, moment.browser)}</span>
              </>
            )}
          </div>
        </div>
      )}

      {fullUrlImages.length > 0 && (
        <ImagePreview
          images={fullUrlImages}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          initialIndex={previewIndex}
        />
      )}
    </article>
  );
}

