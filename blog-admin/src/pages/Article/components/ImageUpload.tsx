import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { PlusOutlined, LoadingOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { uploadFile } from '@/api/file';
import { getFullUrl } from '@/utils/format';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  aspectRatio?: 'video' | 'square' | 'any';
  shape?: 'rect' | 'circle';
  placeholder?: string;
  width?: string | number;
  className?: string;
  category?: string; // 业务分类，如: article_cover, avatar 等
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value, 
  onChange, 
  aspectRatio = 'video',
  shape = 'rect',
  placeholder = '点击或拖拽上传图片',
  width = '100%',
  className = '',
  category
}) => {
  const [loading, setLoading] = useState(false);

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG/WEBP/GIF 格式的图片!');
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB!');
    }
    return isJpgOrPng && isLt5M;
  };

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);
    try {
      const res = await uploadFile(file as File, category);
      onSuccess(res);
      // 存储后端返回的相对路径（filePath）
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

  const uploadButton = (
    <div className="flex flex-col justify-center items-center p-4 w-full h-full">
      {loading ? <LoadingOutlined className="text-2xl text-blue-500" /> : <PlusOutlined className="text-2xl text-gray-400" />}
      <div className="mt-2 text-sm font-medium text-center text-gray-500">{placeholder}</div>
      {shape === 'rect' && (
        <div className="mt-1 text-xs text-gray-400">建议尺寸: 16:9 (最大 5MB)</div>
      )}
    </div>
  );

  const containerClasses = `
    relative group border-2 border-dashed border-gray-200 overflow-hidden 
    transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/30
    ${shape === 'circle' ? 'rounded-full aspect-square' : 'rounded-lg'}
    ${shape === 'rect' && aspectRatio === 'video' ? 'aspect-video' : ''}
    ${shape === 'rect' && aspectRatio === 'square' ? 'aspect-square' : ''}
    ${aspectRatio === 'any' ? 'min-h-[150px]' : ''}
    bg-gray-50 flex items-center justify-center cursor-pointer
    ${className}
  `;

  const fullUrl = getFullUrl(value);

  return (
    <div style={{ width }}>
      <Upload
        name="file"
        listType="picture-card"
        className="w-full single-image-upload"
        showUploadList={false}
        customRequest={handleUpload}
        beforeUpload={beforeUpload}
        accept="image/*"
      >
        <div className={containerClasses}>
          {value ? (
            <>
              <img src={fullUrl} alt="preview" className="object-cover w-full h-full" />
              <div className="flex absolute inset-0 gap-4 justify-center items-center opacity-0 transition-opacity bg-black/40 group-hover:opacity-100">
                <div 
                  className="flex justify-center items-center w-10 h-10 text-lg text-white rounded-full transition-colors bg-white/20 hover:bg-white/40"
                  onClick={handleRemove}
                  title="删除"
                >
                  <DeleteOutlined />
                </div>
              </div>
            </>
          ) : (
            uploadButton
          )}
        </div>
      </Upload>
    </div>
  );
};

export default ImageUpload;
