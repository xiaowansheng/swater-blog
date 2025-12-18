import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Upload } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { getFileList, uploadFile, deleteFile } from '@/api/file'
import { File } from '@/api/file'
import { formatFileSize, formatDate } from '@/utils/format'

const FilePage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    loadFiles()
  }, [pagination.current, pagination.pageSize])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const result = await getFileList({
        page: pagination.current,
        size: pagination.pageSize,
      })
      setFiles(result.records)
      setPagination({ ...pagination, total: result.total })
    } catch (error) {
      console.error('加载文件失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      await uploadFile(file)
      message.success('上传成功')
      loadFiles()
    } catch (error) {
      message.error('上传失败')
    } finally {
      setUploading(false)
    }
    return false
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

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '大小', dataIndex: 'size', key: 'size', render: formatFileSize },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', render: formatDate },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: File) => (
        <Space>
          <a href={record.url} target="_blank" rel="noopener noreferrer">
            查看
          </a>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4">
        <Upload beforeUpload={handleUpload} showUploadList={false}>
          <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
            上传文件
          </Button>
        </Upload>
      </div>
      <Table
        columns={columns}
        dataSource={files}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
        }}
      />
    </div>
  )
}

export default FilePage

