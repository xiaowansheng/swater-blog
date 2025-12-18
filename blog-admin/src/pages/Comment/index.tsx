import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Select } from 'antd'
import { getCommentList, approveComment, rejectComment, deleteComment } from '@/api/comment'
import { Comment } from '@/types'
import { formatDate } from '@/utils/format'

const CommentPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState({ status: undefined })

  useEffect(() => {
    loadComments()
  }, [pagination.current, pagination.pageSize, filters])

  const loadComments = async () => {
    setLoading(true)
    try {
      const result = await getCommentList({
        page: pagination.current,
        size: pagination.pageSize,
        ...filters,
      })
      setComments(result.records)
      setPagination({ ...pagination, total: result.total })
    } catch (error) {
      console.error('加载评论失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await approveComment(id)
      message.success('审核通过')
      loadComments()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await rejectComment(id)
      message.success('已拒绝')
      loadComments()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteComment(id)
      message.success('删除成功')
      loadComments()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const columns = [
    { title: '内容', dataIndex: 'content', key: 'content' },
    { title: '作者', dataIndex: 'authorName', key: 'authorName' },
    { title: '文章', dataIndex: 'postTitle', key: 'postTitle' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const statusMap: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
        return statusMap[status] || '未知'
      },
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', render: formatDate },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Comment) => (
        <Space>
          {record.status === 0 && (
            <>
              <Button type="link" onClick={() => handleApprove(record.id)}>
                通过
              </Button>
              <Button type="link" onClick={() => handleReject(record.id)}>
                拒绝
              </Button>
            </>
          )}
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
        <Select
          placeholder="状态"
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
          style={{ width: 120 }}
          allowClear
        >
          <Select.Option value={0}>待审核</Select.Option>
          <Select.Option value={1}>已通过</Select.Option>
          <Select.Option value={2}>已拒绝</Select.Option>
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={comments}
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

export default CommentPage

