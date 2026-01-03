'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { getFullUrl } from '@/lib/utils/format';
import ImagePreview from '@/components/ImagePreview';

interface ImageWithPreviewProps extends Omit<ImageProps, 'src'> {
  /**
   * 图片路径（可以是相对路径或绝对路径）
   */
  src?: string;
  /**
   * 是否启用预览，默认为 true
   */
  previewEnabled?: boolean;
}

/**
 * 包装后的图片组件 (Next.js 版本)
 * 1. 自动处理路径拼接
 * 2. 支持预览功能的开关
 * 3. 封装了预览弹窗逻辑
 */
export default function ImageWithPreview({
  src,
  alt = 'image',
  previewEnabled = true,
  onClick,
  className = '',
  ...restProps
}: ImageWithPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fullUrl = getFullUrl(src);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (previewEnabled && fullUrl) {
      setIsPreviewOpen(true);
    }
    if (onClick) {
      onClick(e as any);
    }
  };

  if (!fullUrl) {
    return <div className={`flex justify-center items-center text-gray-400 bg-gray-100 ${className}`} {...(restProps as any)}>无图片</div>;
  }

  const { className: imgClassName, ...otherRestProps } = restProps as any;

  return (
    <>
      <div 
        className={`inline-block overflow-hidden relative cursor-pointer ${className}`}
        onClick={handleClick}
        style={restProps.fill ? { width: '100%', height: '100%' } : {}}
      >
        <Image
          src={fullUrl}
          alt={alt}
          className={`object-cover ${imgClassName || ''}`}
          {...otherRestProps}
        />
      </div>

      {previewEnabled && isPreviewOpen && (
        <ImagePreview
          images={[fullUrl]}
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      )}
    </>
  );
}
