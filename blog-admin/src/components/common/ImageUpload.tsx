import React, { useState } from 'react';
import { Upload, message, Modal } from 'antd';
import Image from '@/components/common/ImageWithPreview';
import {
  LoadingOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';
import { uploadFile } from '@/api/file';
import { getFullUrl, toRelativeUrl } from '@/utils/format';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  aspectRatio?: 'video' | 'square' | 'any' | 'portrait';
  shape?: 'rect' | 'circle';
  placeholder?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  limitSize?: number; // 限制大小，单位 MB
  children?: React.ReactNode; // 自定义未上传时的显示内容
  showHint?: boolean; // 是否显示默认的比例和大小提示
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  aspectRatio = 'video',
  shape = 'rect',
  placeholder,
  width = '100%',
  height,
  className = '',
  limitSize = 5,
  children,
  showHint,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // 如果有 children，默认不显示提示，除非显式指定 showHint 为 true
  // 此外，如果高度过小（如头像、小图标），默认也不显示详细提示
  const isSmall = (typeof height === 'number' && height < 150) || (shape === 'circle');
  const shouldShowHint = showHint ?? (children || isSmall ? false : true);

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
    }
    const isLtSize = file.size / 1024 / 1024 < limitSize;
    if (!isLtSize) {
      message.error(`图片大小不能超过 ${limitSize}MB!`);
    }
    return isImage && isLtSize;
  };

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);
    try {
      const res = await uploadFile(file as File);
      onSuccess(res);
      // 使用 toRelativeUrl 统一转为 ./ 开头的相对路径
      const path = toRelativeUrl(res.url || res.storagePath);
      onChange?.(path);
      message.success('上传成功');
    } catch (error) {
      onError(error);
      message.error('上传失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewOpen(true);
  };

  // 根据类型确定默认占位文字和图标
  const renderPlaceholder = () => {
    if (placeholder) return placeholder;
    return '上传图片';
  };

  const renderIcon = () => {
    if (loading) return <LoadingOutlined className={`${isSmall ? 'text-xl' : 'text-2xl'} text-blue-500`} />;
    return <CloudUploadOutlined className={`${isSmall ? 'text-2xl' : 'text-4xl'} text-gray-300 transition-colors group-hover:text-blue-400`} />;
  };

  // 容器样式和类名
  const getContainerProps = () => {
    const baseClasses = "relative group flex flex-col items-center justify-center border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden shadow-sm hover:shadow-md w-full";

    let shapeClass = "rounded-xl";
    const style: React.CSSProperties = {};

    if (shape === 'circle') {
      shapeClass = "rounded-full";
      style.aspectRatio = '1 / 1';
    } else {
      if (aspectRatio === 'video') style.aspectRatio = '16 / 9';
      else if (aspectRatio === 'square') style.aspectRatio = '1 / 1';
      else if (aspectRatio === 'portrait') style.aspectRatio = '3 / 4';
      else if (aspectRatio === 'any' && !height) style.minHeight = '180px';
    }

    if (height) style.height = height;

    const borderClass = "border-gray-200 bg-gray-400/10 hover:border-blue-400 hover:bg-white";

    return {
      className: `${baseClasses} ${shapeClass} ${borderClass} ${className}`,
      style
    };
  };

  const containerProps = getContainerProps();

  return (
    <div style={{ width }}>
      <Upload
        name="file"
        listType="picture-card"
        className="w-full single-image-upload-wrapper"
        showUploadList={false}
        customRequest={handleUpload}
        beforeUpload={beforeUpload}
        accept="image/*"
      >
        <div {...containerProps}>
          {value ? (
            <>
              {/* 图片预览 - 始终保持 cover 样式占满空间 */}
              <div className="overflow-hidden absolute inset-0 w-full h-full">
                <Image
                  src={getFullUrl(value)}
                  alt="preview"
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  style={{ width: '100%', height: '100%', display: 'block' }}
                  wrapperClassName="w-full h-full block"
                  previewEnabled={false}
                />
              </div>

              {/* 遮罩层 - 悬停显示操作 */}
              <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-[1px] ${isSmall ? 'gap-1' : 'gap-3'}`}>
                {/* 重新上传提示 - 只有在空间足够时显示 */}
                {!isSmall && (
                  <div className="flex flex-col items-center mb-2 text-white pointer-events-none">
                    <CloudUploadOutlined className="mb-1 text-3xl" />
                    <span className="text-xs font-medium">点击或拖拽重新上传</span>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className={`flex items-center ${isSmall ? 'gap-2' : 'gap-4'}`}>
                  <div
                    className={`flex justify-center items-center text-white rounded-full transition-all duration-200 bg-white/20 hover:bg-white/40 hover:scale-110 active:scale-95 ${isSmall ? 'w-8 h-8' : 'w-10 h-10'}`}
                    onClick={handlePreview}
                    title="预览"
                  >
                    <EyeOutlined className={isSmall ? 'text-base' : 'text-lg'} />
                  </div>
                  <div
                    className={`flex justify-center items-center text-white rounded-full transition-all duration-200 bg-white/20 hover:bg-red-500/60 hover:scale-110 active:scale-95 ${isSmall ? 'w-8 h-8' : 'w-10 h-10'}`}
                    onClick={handleRemove}
                    title="删除"
                  >
                    <DeleteOutlined className={isSmall ? 'text-base' : 'text-lg'} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={`flex flex-col items-center justify-center w-full h-full text-center ${isSmall ? 'gap-1 p-1' : 'gap-2 p-4 md:p-6'}`}>
              {children || (
                <>
                  <div className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-y-1">
                    {renderIcon()}
                  </div>
                  <div className={`flex-shrink-0 font-semibold text-gray-500 transition-colors group-hover:text-blue-500 ${isSmall ? 'text-xs' : 'text-sm'}`}>
                    {renderPlaceholder()}
                  </div>
                  {shouldShowHint && (
                    <div className="flex-shrink-0 mt-1 text-xs leading-relaxed text-gray-400">
                      建议比例 {aspectRatio === 'video' ? '16:9' : aspectRatio === 'square' ? '1:1' : '3:4'}<br />
                      支持 JPG, PNG, WEBP (最大 {limitSize}MB)
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 上传中状态 */}
          {loading && (
            <div className="flex absolute inset-0 z-10 flex-col justify-center items-center backdrop-blur-sm bg-white/80">
              <LoadingOutlined className="mb-2 text-3xl text-blue-500" />
              <span className="text-xs font-medium text-gray-500">上传中...</span>
            </div>
          )}
        </div>
      </Upload>

      <Modal
        open={previewOpen}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
        width={800}
      >
        <Image alt="preview" style={{ width: '100%' }} src={getFullUrl(value)} previewEnabled={false} />
      </Modal>

      <style dangerouslySetInnerHTML={{
        __html: `
        .single-image-upload-wrapper.ant-upload-wrapper {
          width: 100% !important;
        }
        .single-image-upload-wrapper .ant-upload {
          width: 100% !important;
          height: auto !important;
          background: transparent !important;
          border: none !important;
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
        }
        .single-image-upload-wrapper .ant-upload-select-picture-card {
          width: 100% !important;
          height: auto !important;
          border: none !important;
          background: transparent !important;
          margin: 0 !important;
        }
        .single-image-upload-wrapper .ant-image {
          width: 100%;
          height: 100%;
        }
        .single-image-upload-wrapper .ant-image-img {
          height: 100% !important;
          object-fit: cover;
        }
      `}} />
    </div>
  );
};

export default ImageUpload;

/**
 * 扩展组件：头像上传
 */
export const AvatarUpload: React.FC<Omit<ImageUploadProps, 'shape' | 'aspectRatio'>> = (props) => (
  <ImageUpload
    {...props}
    shape="circle"
    aspectRatio="square"
    width={props.width || 120}
    height={props.height || 120}
  />
);

/**
 * 扩展组件：封面图上传 (16:9)
 */
export const CoverUpload: React.FC<ImageUploadProps> = (props) => (
  <ImageUpload
    {...props}
    aspectRatio="video"
  />
);

/**
 * 扩展组件：正方形上传 (1:1)
 */
export const SquareUpload: React.FC<Omit<ImageUploadProps, 'aspectRatio'>> = (props) => (
  <ImageUpload
    {...props}
    aspectRatio="square"
  />
);

/**
 * 扩展组件：自定义上传
 * 支持完全自定义内部显示内容
 */
export const CustomUpload: React.FC<ImageUploadProps> = (props) => (
  <ImageUpload
    {...props}
  />
);
