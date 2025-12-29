import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Space, Popconfirm, message, Tag, Tooltip, Switch } from 'antd'
import Image from '@/components/common/ImageWithPreview'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons'
import { getTalkList, deleteTalk, setTalkTop, cancelTalkTop } from '@/api/talk'
import { Talk } from '@/types'

const TalkPage: React.FC = () => {
  const navigate = useNavigate()
  const [talks, setTalks] = useState<Talk[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    loadTalks()
  }, [pagination.current, pagination.pageSize])

  const loadTalks = async () => {
    setLoading(true)
    try {
      const result = await getTalkList({
        page: pagination.current,
        size: pagination.pageSize,
      })
      setTalks(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('加载说说失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    navigate('/talk/create')
  }

  const handleEdit = (talk: Talk) => {
    navigate(`/talk/edit/${talk.id}`)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTalk(id)
      message.success('删除成功')
      loadTalks()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleTopChange = async (record: Talk) => {
    try {
      if (record.isTop === 1) {
        await cancelTalkTop(record.id)
      } else {
        await setTalkTop(record.id)
      }
      message.success('操作成功')
      loadTalks()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (content: string, record: Talk) => (
        <div className="flex flex-col gap-1 max-w-[400px]">
          <div className="flex items-center">
            {record.isTop === 1 && (
              <Tag color="red" className="mr-2">
                <VerticalAlignTopOutlined /> 置顶
              </Tag>
            )}
          </div>
          <div 
            className="rich-text-content line-clamp-2 text-sm text-gray-600"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      ),
    },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      width: 150,
      render: (images: string[]) => (
        <div className="flex items-center gap-1">
          {images && images.length > 0 ? (
            <Image.PreviewGroup>
              {images.slice(0, 3).map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  width={40}
                  height={40}
                  className="object-cover rounded"
                />
              ))}
              {images.length > 3 && (
                <span className="text-gray-400 text-xs">+{images.length - 3}</span>
              )}
            </Image.PreviewGroup>
          ) : (
            <span className="text-gray-400 flex items-center gap-1">
              <PictureOutlined /> 无图片
            </span>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === '1' ? 'success' : 'default'}>
          {status === '1' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '置顶',
      dataIndex: 'isTop',
      key: 'isTop',
      width: 80,
      render: (isTop: number, record: Talk) => (
        <Switch
          checked={isTop === 1}
          onChange={() => handleTopChange(record)}
        />
      ),
    },
    {
      title: '互动',
      key: 'interaction',
      width: 120,
      render: (_: any, record: Talk) => (
        <div className="text-xs text-gray-500">
          <span>❤️ {record.likeCount || 0}</span>
          <span className="ml-2">💬 {record.commentCount || 0}</span>
        </div>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Talk) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这条说说吗？"
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
      <div className="search-bar flex justify-between items-center">
        <h2 className="text-lg font-medium">说说管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          发布说说
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={talks}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条说说`,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
        />
      </div>
    </div>
  )
}

export default TalkPage
