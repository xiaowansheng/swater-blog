'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ImagePreviewProps {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
}

export default function ImagePreview({ 
  images, 
  open, 
  onOpenChange, 
  initialIndex = 0 
}: ImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, images.length, onOpenChange]);

  if (!open) return null;

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={() => onOpenChange(false)}
    >
      <button
        className="absolute z-10 text-white transition-colors top-4 right-4 hover:text-gray-300"
        onClick={() => onOpenChange(false)}
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {images.length > 1 && (
        <>
          <button
            className="absolute z-10 p-2 text-white transition-colors transform -translate-y-1/2 left-4 top-1/2 hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            className="absolute z-10 p-2 text-white transition-colors transform -translate-y-1/2 right-4 top-1/2 hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <div 
        className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[currentIndex]}
          alt={`预览图片 ${currentIndex + 1}`}
          fill
          className="object-contain"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="absolute text-white bottom-4">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

