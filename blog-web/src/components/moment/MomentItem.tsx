'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { MomentVO } from '@/types';
import { formatDate } from '@/lib/utils/format';

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
  const contentRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [shouldTruncate, setShouldTruncate] = useState(false);
  const [imagesPerRow, setImagesPerRow] = useState(3);
  const [displayCount, setDisplayCount] = useState(0);

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

  const handleClick = () => {
    router.push(`/moment/${moment.id}`);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/moment/${moment.id}`);
  };

  const totalImages = moment.images?.length || 0;
  const showMore = totalImages > displayCount;
  const displayImages = moment.images?.slice(0, displayCount) || [];

  return (
    <article 
      className="p-6 transition-all border cursor-pointer rounded-2xl bg-card border-border hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="flex items-start gap-4 mb-4">
        {moment.authorAvatar && (
          <Image
            src={moment.authorAvatar}
            alt={moment.authorName || '作者'}
            width={48}
            height={48}
            className="rounded-full shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">{moment.authorName || '博主'}</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(moment.createTime)}
            </span>
          </div>
          <div 
            ref={contentRef}
            className="relative overflow-hidden prose-sm prose max-w-none dark:prose-invert"
            style={shouldTruncate ? { 
              maxHeight: `${MAX_HEIGHT}px`,
              maskImage: 'linear-gradient(to bottom, black calc(100% - 20px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 20px), transparent 100%)'
            } : {}}
            dangerouslySetInnerHTML={{ __html: moment.content }}
          />
        </div>
      </div>

      {moment.images && moment.images.length > 0 && (
        <div 
          ref={imageContainerRef}
          className="grid gap-2 mb-4"
          style={{ gridTemplateColumns: `repeat(${imagesPerRow}, 1fr)` }}
          onClick={handleImageClick}
        >
          {displayImages.map((img, idx) => (
            <div 
              key={idx} 
              className="relative overflow-hidden rounded-lg aspect-video bg-muted"
              style={{
                minWidth: `${MIN_IMAGE_WIDTH}px`,
                maxWidth: `${MAX_IMAGE_WIDTH}px`
              }}
            >
              <Image
                src={img}
                alt={`${moment.content.substring(0, 20)}...`}
                fill
                className="object-cover"
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
    </article>
  );
}

