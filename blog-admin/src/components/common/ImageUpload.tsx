import React, { useState } from 'react';
import { Upload, message, Modal } from 'antd';
import { 
  PlusOutlined, 
  LoadingOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  CloudUploadOutlined 
} from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';
import { uploadFile } from '@/api/file';
import { getFullUrl } from '@/utils/format';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  aspectRatio?: 'video' | 'square' | 'any' | 'portrait';
  shape?: 'rect' | 'circle';
  placeholder?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  category?: string; // 业务分类，如: article_cover, avatar 等
  type?: 'cover' | 'avatar' | 'card'; // 样式类型
  limitSize?: number; // 限制大小，单位 MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value, 
  onChange, 
  aspectRatio = 'video',
  shape = 'rect',
  placeholder,
  width = '100%',
  height,
  className = '',
  category,
  type = 'cover',
  limitSize = 5
}) => {
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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
      const res = await uploadFile(file as File, category);
      onSuccess(res);
      onChange?.(res.filePath);
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

  const fullUrl = getFullUrl(value);

  // 根据类型确定默认占位文字和图标
  const renderPlaceholder = () => {
    if (placeholder) return placeholder;
    if (type === 'avatar') return '上传头像';
    if (type === 'cover') return '上传封面图';
    return '点击或拖拽上传';
  };

  const renderIcon = () => {
    if (loading) return <LoadingOutlined className="text-2xl text-blue-500" />;
    if (type === 'avatar') return <PlusOutlined className="text-2xl text-gray-400 group-hover:text-blue-500 transition-colors" />;
    return <CloudUploadOutlined className="text-4xl text-gray-300 group-hover:text-blue-400 transition-colors mb-3" />;
  };

  // 容器样式和类名
  const getContainerProps = () => {
    const baseClasses = "relative group flex flex-col items-center justify-center border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden shadow-sm hover:shadow-md w-full";
    
    let shapeClass = "rounded-xl";
    const style: React.CSSProperties = {};

    if (shape === 'circle' || type === 'avatar') {
      shapeClass = "rounded-full";
      style.aspectRatio = '1 / 1';
    } else if (type === 'cover') {
      if (aspectRatio === 'video') style.aspectRatio = '16 / 9';
      else if (aspectRatio === 'square') style.aspectRatio = '1 / 1';
      else if (aspectRatio === 'portrait') style.aspectRatio = '3 / 4';
      else if (aspectRatio === 'any' && !height) style.minHeight = '180px';
    }

    if (height) style.height = height;

    const borderClass = isDragOver 
      ? "border-blue-500 bg-blue-50/50 scale-[1.02] ring-4 ring-blue-500/10" 
      : "border-gray-200 bg-gray-400/10 hover:border-blue-400 hover:bg-white";

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
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={() => setIsDragOver(false)}
      >
        <div {...containerProps}>
          {value ? (
            <>
              {/* 图片铺满容器 */}
              <img 
                src={fullUrl} 
                alt="preview" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              
              {/* 遮罩层 - 默认透明，悬停显示 */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[1px]">
                {/* 重新上传提示 */}
                <div className="flex flex-col items-center text-white mb-2 pointer-events-none">
                  <CloudUploadOutlined className="text-3xl mb-1" />
                  <span className="text-xs font-medium">点击或拖拽重新上传</span>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-all duration-200 hover:scale-110 active:scale-95"
                    onClick={handlePreview}
                    title="预览"
                  >
                    <EyeOutlined className="text-lg" />
                  </div>
                  <div 
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-red-500/60 text-white transition-all duration-200 hover:scale-110 active:scale-95"
                    onClick={handleRemove}
                    title="删除"
                  >
                    <DeleteOutlined className="text-lg" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 flex flex-col items-center text-center">
              <div className="transition-transform duration-300 group-hover:-translate-y-1">
                {renderIcon()}
              </div>
              <div className="text-sm text-gray-500 font-semibold group-hover:text-blue-500 transition-colors">{renderPlaceholder()}</div>
              {type === 'cover' && (
                <div className="mt-2 text-xs text-gray-400 leading-relaxed">
                  建议比例 {aspectRatio === 'video' ? '16:9' : aspectRatio === 'square' ? '1:1' : '3:4'}<br/>
                  支持 JPG, PNG, WEBP (最大 {limitSize}MB)
                </div>
              )}
            </div>
          )}
          
          {/* 上传中状态 */}
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <LoadingOutlined className="text-3xl text-blue-500 mb-2" />
              <span className="text-xs text-gray-500 font-medium">上传中...</span>
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
        <img alt="preview" style={{ width: '100%' }} src={fullUrl} />
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />
    </div>
  );
};

export default ImageUpload;
