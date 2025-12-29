'use client';

import { useState } from 'react';
import Image from '@/components/common/ImageWithPreview';
import ImagePreview from '@/components/ImagePreview';
import { getFullUrl } from '@/lib/utils/format';

interface MomentImagesProps {
  images: string[];
  alt: string;
}

export default function MomentImages({ images, alt }: MomentImagesProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const fullUrlImages = images.map(img => getFullUrl(img));

  const handleImageClick = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  return (
    <>
      <div className={`grid gap-4 mt-6 ${
        images.length === 1 
          ? 'grid-cols-1 max-w-md' 
          : images.length === 2 
          ? 'grid-cols-2 max-w-2xl'
          : 'grid-cols-3 max-w-3xl'
      }`}>
        {fullUrlImages.map((img, idx) => (
          <div 
            key={idx} 
            className="relative aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleImageClick(idx)}
          >
            <Image
              src={img}
              alt={`${alt} - ${idx + 1}`}
              fill
              className="object-cover"
              loading="lazy"
              previewEnabled={false}
            />
          </div>
        ))}
      </div>

      <ImagePreview
        images={fullUrlImages}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        initialIndex={previewIndex}
      />
    </>
  );
}

