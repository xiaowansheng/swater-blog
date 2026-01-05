import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Upload, Tag, Input, Select, Tooltip, Card, Row, Col, Modal } from 'antd'
import Image from '@/components/common/ImageWithPreview'
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FileImageOutlined,
  FileOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { getFileList, uploadFile, deleteFile } from '@/api/file'
import { FileMeta } from '@/types'
import { formatFileSize, getFullUrl } from '@/utils/format'

const FilePage: React.FC = () => {
  const [files, setFiles] = useState<FileMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [filters, setFilters] = useState<{ keyword?: string; fileType?: string }>({})
  const [previewFile, setPreviewFile] = useState<FileMeta | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)

  useEffect(() => {
    loadFiles()
  }, [pagination.current, pagination.pageSize])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const result = await getFileList({
        page: pagination.current,
        size: pagination.pageSize,
        ...filters,
      })
      setFiles(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('加载文件失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options
    setUploading(true)
    try {
      await uploadFile(file)
      message.success('上传成功')
      onSuccess?.()
      loadFiles()
    } catch (error) {
      message.error('上传失败')
      onError?.(error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteFile(id)
      message.success('删除成功')
      loadFiles()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleCopyUrl = (url: string) => {
    const fullUrl = getFullUrl(url)
    navigator.clipboard.writeText(fullUrl)
    message.success('链接已复制')
  }

  const handlePreview = (file: FileMeta) => {
    setPreviewFile(file)
    setPreviewVisible(true)
  }

  const renderPreviewContent = () => {
    if (!previewFile) return null

    const fullUrl = getFullUrl(previewFile.url)

    if (previewFile.mimeType?.startsWith('image')) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <Image
            src={fullUrl}
            alt={previewFile.originalName}
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
            preview={false}
          />
        </div>
      )
    }

    if (previewFile.mimeType?.startsWith('video')) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <video
            src={fullUrl}
            controls
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
          />
        </div>
      )
    }

    if (previewFile.mimeType?.includes('pdf')) {
      return (
        <div className="min-h-[70vh]">
          <iframe
            src={fullUrl}
            style={{ width: '100%', height: '70vh', border: 'none' }}
            title={previewFile.originalName}
          />
        </div>
      )
    }

    if (previewFile.mimeType?.includes('text') || previewFile.mimeType?.includes('json')) {
      return (
        <div className="min-h-[400px]">
          <iframe
            src={fullUrl}
            style={{ width: '100%', height: '70vh', border: 'none' }}
            title={previewFile.originalName}
          />
        </div>
      )
    }

    return (
      <div className="text-center py-12">
        <FileOutlined className="text-6xl text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">该文件类型不支持预览</p>
        <Button type="primary" onClick={() => window.open(fullUrl, '_blank')}>
          在新窗口打开
        </Button>
      </div>
    )
  }

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image')) return <FileImageOutlined className="text-green-500" />
    if (fileType?.startsWith('video')) return <VideoCameraOutlined className="text-purple-500" />
    if (fileType?.includes('pdf') || fileType?.includes('document')) return <FileTextOutlined className="text-red-500" />
    return <FileOutlined className="text-gray-500" />
  }

  const getFileTypeTag = (fileType: string) => {
    if (fileType?.startsWith('image')) return <Tag color="green">图片</Tag>
    if (fileType?.startsWith('video')) return <Tag color="purple">视频</Tag>
    if (fileType?.includes('pdf')) return <Tag color="red">PDF</Tag>
    return <Tag>其他</Tag>
  }

  const isImage = (mimeType: string) => mimeType?.startsWith('image')

  const columns = [
    {
      title: '文件',
      key: 'file',
      width: 300,
      render: (_: any, record: FileMeta) => (
        <div className="flex items-center gap-3">
          {isImage(record.mimeType) ? (
            <Image
              src={getFullUrl(record.url)}
              width={48}
              height={48}
              className="object-cover rounded"
              preview={{ mask: <EyeOutlined /> }}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-2xl">
              {getFileIcon(record.mimeType)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate" title={record.originalName}>
              {record.originalName}
            </div>
            <div className="text-xs text-gray-400">{record.mimeType}</div>
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'mimeType',
      key: 'type',
      width: 100,
      render: getFileTypeTag,
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'size',
      width: 100,
      render: formatFileSize,
    },
    {
      title: '尺寸',
      key: 'dimensions',
      width: 100,
      render: (_: any, record: FileMeta) =>
        record.width && record.height ? `${record.width}×${record.height}` : '-',
    },
    {
      title: '上传时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: FileMeta) => (
        <Space>
          <Tooltip title="复制链接">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopyUrl(record.url)}
            />
          </Tooltip>
          <Tooltip title="查看">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这个文件吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="search-bar">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="搜索文件名"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="文件类型"
            value={filters.fileType}
            onChange={(value) => setFilters({ ...filters, fileType: value })}
            style={{ width: 140 }}
            allowClear
          >
            <Select.Option value="image">图片</Select.Option>
            <Select.Option value="video">视频</Select.Option>
            <Select.Option value="document">文档</Select.Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={loadFiles}>
            搜索
          </Button>
          <div className="flex-1" />
          <Space>
            <Button
              icon={<UnorderedListOutlined />}
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            />
            <Button
              icon={<AppstoreOutlined />}
              type={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => setViewMode('grid')}
            />
          </Space>
          <Upload customRequest={handleUpload} showUploadList={false} multiple>
            <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
              上传文件
            </Button>
          </Upload>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="table-container">
          <Table
            columns={columns}
            dataSource={files}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 个文件`,
              onChange: (page, pageSize) =>
                setPagination({ ...pagination, current: page, pageSize }),
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg p-4">
          <Row gutter={[16, 16]}>
            {files.map((file) => (
              <Col xs={12} sm={8} md={6} lg={4} key={file.id}>
                <Card
                  hoverable
                  cover={
                    isImage(file.mimeType) ? (
                      <div className="h-32 overflow-hidden">
                        <Image
                          src={getFullUrl(file.url)}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-gray-100 flex items-center justify-center text-4xl">
                        {getFileIcon(file.mimeType)}
                      </div>
                    )
                  }
                  actions={[
                    <CopyOutlined key="copy" onClick={() => handleCopyUrl(file.url)} />,
                    <EyeOutlined key="view" onClick={() => handlePreview(file)} />,
                    <Popconfirm
                      key="delete"
                      title="确定删除？"
                      onConfirm={() => handleDelete(file.id)}
                    >
                      <DeleteOutlined className="text-red-500" />
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <span className="text-sm truncate" title={file.originalName}>
                        {file.originalName}
                      </span>
                    }
                    description={
                      <span className="text-xs text-gray-400">
                        {formatFileSize(file.fileSize)}
                      </span>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <Modal
        title={previewFile?.originalName || '文件预览'}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 1200 }}
        styles={{ body: { padding: '24px' } }}
      >
        {renderPreviewContent()}
      </Modal>
    </div>
  )
}

export default FilePage
