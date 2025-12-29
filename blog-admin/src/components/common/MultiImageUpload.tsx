import React, { useState, useEffect } from 'react';
import { Upload, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { uploadFile } from '@/api/file';
import { getFullUrl } from '@/utils/format';

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
      const currentUrls = fileList.map(f => f.url || (f.response?.url || f.response?.storagePath)).filter(Boolean);
      if (JSON.stringify(currentUrls) !== JSON.stringify(value)) {
        setFileList(newList);
      }
    }
  }, [value]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    
    // Only call onChange when all files are done or removed
    const allDone = newFileList.every(file => file.status === 'done' || file.status === 'removed');
    if (allDone) {
      const urls = newFileList
        .map(file => {
          if (file.url) return file.url;
          if (file.response) return file.response.url || file.response.storagePath;
          return null;
        })
        .filter((url): url is string => !!url);
      
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
