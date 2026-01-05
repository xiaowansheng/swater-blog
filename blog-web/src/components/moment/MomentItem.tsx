'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/components/common/ImageWithPreview';
import type { MomentVO } from '@/types';
import { formatDate, getFullUrl } from '@/lib/utils/format';
import ImagePreview from '@/components/ImagePreview';
import { useSiteConfig } from '@/lib/context/SiteConfigContext';

interface MomentItemProps {
  moment: MomentVO;
}

const MAX_HEIGHT = 120;
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
          <span>❤️</span>
          <span>{moment.likeCount || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💬</span>
          <span>{moment.commentCount || 0}</span>
        </div>
      </div>

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

