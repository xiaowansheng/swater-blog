import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Select, Tag, Avatar, Tooltip, Input } from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { getCommentList, approveComment, rejectComment, deleteComment } from '@/api/comment'
import { Comment } from '@/types'

const CommentPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState<{ status: number | undefined; keyword: string }>({
    status: undefined,
    keyword: '',
  })

  useEffect(() => {
    loadComments()
  }, [pagination.current, pagination.pageSize, filters.status])

  const loadComments = async () => {
    setLoading(true)
    try {
      const result = await getCommentList({
        page: pagination.current,
        size: pagination.pageSize,
        status: filters.status,
      })
      setComments(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
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

  const getStatusTag = (status: number) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      0: { color: 'warning', text: '待审核' },
      1: { color: 'success', text: '已通过' },
      2: { color: 'error', text: '已拒绝' },
    }
    const { color, text } = statusMap[status] || { color: 'default', text: '未知' }
    return <Tag color={color}>{text}</Tag>
  }

  const columns = [
    {
      title: '评论者',
      key: 'author',
      width: 180,
      render: (_: any, record: Comment) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.authorAvatar} icon={<UserOutlined />} size={32} />
          <div>
            <div className="font-medium text-sm">{record.authorName}</div>
            <div className="text-xs text-gray-400">{record.authorEmail}</div>
          </div>
        </div>
      ),
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '评论文章',
      dataIndex: 'postTitle',
      key: 'postTitle',
      width: 200,
      ellipsis: true,
      render: (title: string) => (
        <span className="text-blue-500 cursor-pointer hover:underline">{title}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: getStatusTag,
    },
    {
      title: '评论时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: Comment) => (
        <Space>
          {record.status === 0 && (
            <>
              <Tooltip title="通过">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  className="text-green-500"
                  onClick={() => handleApprove(record.id)}
                />
              </Tooltip>
              <Tooltip title="拒绝">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  className="text-orange-500"
                  onClick={() => handleReject(record.id)}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm title="确定删除这条评论吗？" onConfirm={() => handleDelete(record.id)}>
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
        <div className="flex items-center gap-4">
          <Input
            placeholder="搜索评论内容"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="评论状态"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 140 }}
            allowClear
          >
            <Select.Option value={0}>待审核</Select.Option>
            <Select.Option value={1}>已通过</Select.Option>
            <Select.Option value={2}>已拒绝</Select.Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={loadComments}>
            搜索
          </Button>
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={comments}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条评论`,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
        />
      </div>
    </div>
  )
}

export default CommentPage
