import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getTalkList, deleteTalk } from '@/api/talk'
import { Talk } from '@/api/talk'
import { formatDate } from '@/utils/format'

const TalkPage: React.FC = () => {
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
      setPagination({ ...pagination, total: result.total })
    } catch (error) {
      console.error('加载说说失败', error)
    } finally {
      setLoading(false)
    }
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

  const columns = [
    { title: '内容', dataIndex: 'content', key: 'content' },
    { title: '图片', dataIndex: 'images', key: 'images', render: (images: string[]) => images?.length || 0 },
    { title: '置顶', dataIndex: 'isTop', key: 'isTop', render: (isTop: boolean) => (isTop ? '是' : '否') },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', render: formatDate },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Talk) => (
        <Space>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>
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
        <Button type="primary" icon={<PlusOutlined />}>
          新建说说
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={talks}
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

export default TalkPage

