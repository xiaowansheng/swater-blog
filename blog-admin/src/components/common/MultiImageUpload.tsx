import React, { useState, useEffect } from 'react';
import { Upload, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { uploadFile } from '@/api/file';
import { getFullUrl } from '@/utils/format';

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

interface MultiImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  category?: string;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  value = [],
  onChange,
  maxCount = 9,
  category = 'talk',
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Sync value from props to internal fileList
  useEffect(() => {
    if (value && Array.isArray(value)) {
      const newList = value.map((url, index) => ({
        uid: `-${index}`,
        name: url.substring(url.lastIndexOf('/') + 1),
        status: 'done' as const,
        url: getFullUrl(url),
      }));
      
      // Only update if the URLs have actually changed to avoid infinite loops
      const getRelativePath = (url: string | undefined) => {
        if (!url) return '';
        if (url.includes('/uploads/')) {
          return url.split('/uploads/')[1];
        }
        return url;
      };

      const currentUrls = fileList
        .map(f => {
          if (f.response) return f.response.url || f.response.storagePath;
          return getRelativePath(f.url);
        })
        .filter(Boolean);

      if (JSON.stringify(currentUrls) !== JSON.stringify(value)) {
        setFileList(newList);
      }
    }
  }, [value]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || (file.url ? file.url.substring(file.url.lastIndexOf('/') + 1) : '图片预览'));
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    // 处理上传成功后的 URL
    const processedFileList = newFileList.map(file => {
      if (file.status === 'done' && file.response) {
        const url = file.response.url || file.response.storagePath;
        return {
          ...file,
          url: getFullUrl(url)
        };
      }
      return file;
    });

    setFileList(processedFileList);
    
    // Only call onChange when all files are done or removed
    const allDone = processedFileList.every(file => file.status === 'done' || file.status === 'removed' || file.status === 'error');
    if (allDone) {
      const urls = processedFileList
        .filter(file => file.status === 'done')
        .map(file => {
          // 返回原始路径给后端
          if (file.response) return file.response.url || file.response.storagePath;
          // 如果是初始加载的，从 url 中还原或保留
          return file.url; 
        })
        .filter((url): url is string => !!url)
        // 确保如果是完整 URL，如果是从 getFullUrl 产生的，我们需要根据业务逻辑决定是否还原
        // 但通常 value 传进来是什么，我们传出去就应该保持一致格式（相对路径）
        .map(url => {
          // 如果 url 包含了 uploads 前缀，尝试提取相对路径
          if (url.includes('/uploads/')) {
            return url.split('/uploads/')[1];
          }
          return url;
        });
      
      onChange?.(urls);
    }
  };

  const handleCustomRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      const res = await uploadFile(file as File, category);
      onSuccess(res);
      message.success('上传成功');
    } catch (error) {
      onError(error);
      message.error('上传失败');
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  return (
    <>
      <Upload
        customRequest={handleCustomRequest}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        accept="image/*"
        multiple
        maxCount={maxCount}
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default MultiImageUpload;
