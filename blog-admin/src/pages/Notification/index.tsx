import { useState, useEffect } from 'react'
import { Table, Button, Space, message, Tag, Popconfirm, Tooltip, Select, Empty } from 'antd'
import {
  CheckOutlined,
  DeleteOutlined,
  BellOutlined,
  CommentOutlined,
  HeartOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  retryNotification,
  retryNotifications,
} from '@/api/notification'
import { useNotificationStore } from '@/store/notification'
import { Notification } from '@/types'

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const { setNotifications: setStoreNotifications, markAsRead: markStoreAsRead, markAllAsRead: markStoreAllAsRead } = useNotificationStore()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState<{ isRead?: number }>({})
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])

  useEffect(() => {
    loadNotifications()
  }, [pagination.current, pagination.pageSize, filters])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const result = await getNotifications({
        page: pagination.current,
        size: pagination.pageSize,
        ...filters,
      })
      setNotifications(result.records)
      setStoreNotifications(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('加载通知失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id)
      markStoreAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n))
      )
      message.success('已标记为已读')
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      markStoreAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 1 })))
      message.success('已全部标记为已读')
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id)
      message.success('删除成功')
      loadNotifications()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleRetry = async (id: number) => {
    try {
      await retryNotification(id)
      message.success('已提交重发')
      loadNotifications()
    } catch (error) {
      message.error('重发失败')
    }
  }

  const handleRetryBatch = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择通知')
      return
    }
    try {
      await retryNotifications(selectedRowKeys)
      message.success('已提交批量重发')
      setSelectedRowKeys([])
      loadNotifications()
    } catch (error) {
      message.error('批量重发失败')
    }
  }

  const getTypeIcon = (type: string) => {
    const normalized = type?.toUpperCase()
    const lower = type?.toLowerCase()
    const iconMap: Record<string, React.ReactNode> = {
      COMMENT: <CommentOutlined className="text-blue-500" />,
      COMMENT_REPLY: <CommentOutlined className="text-blue-500" />,
      COMMENT_APPROVED: <CommentOutlined className="text-blue-500" />,
      USER_LOGIN: <BellOutlined className="text-orange-500" />,
      USER_REGISTER: <BellOutlined className="text-orange-500" />,
      PASSWORD_RESET: <BellOutlined className="text-orange-500" />,
      GUESTBOOK: <BellOutlined className="text-orange-500" />,
      FRIEND_LINK: <HeartOutlined className="text-red-500" />,
      FRIEND_LINK_APPROVED: <HeartOutlined className="text-red-500" />,
      SYSTEM: <BellOutlined className="text-orange-500" />,
      comment: <CommentOutlined className="text-blue-500" />,
      like: <HeartOutlined className="text-red-500" />,
      article: <FileTextOutlined className="text-green-500" />,
      system: <BellOutlined className="text-orange-500" />,
    }
    if (iconMap[normalized]) return iconMap[normalized]
    if (iconMap[lower]) return iconMap[lower]
    return iconMap[type] || <BellOutlined className="text-gray-500" />
  }

  const getTypeTag = (type: string) => {
    const normalized = type?.toUpperCase()
    const typeMap: Record<string, { color: string; text: string }> = {
      COMMENT: { color: 'blue', text: '评论' },
      COMMENT_REPLY: { color: 'blue', text: '回复' },
      COMMENT_APPROVED: { color: 'blue', text: '审核' },
      USER_LOGIN: { color: 'orange', text: '登录' },
      USER_REGISTER: { color: 'orange', text: '注册' },
      PASSWORD_RESET: { color: 'orange', text: '重置' },
      GUESTBOOK: { color: 'orange', text: '留言' },
      FRIEND_LINK: { color: 'red', text: '友链' },
      FRIEND_LINK_APPROVED: { color: 'red', text: '友链通过' },
      SYSTEM: { color: 'purple', text: '系统' },
      comment: { color: 'blue', text: '评论' },
      like: { color: 'red', text: '点赞' },
      article: { color: 'green', text: '文章' },
      system: { color: 'orange', text: '系统' },
    }
    const { color, text } = typeMap[normalized] || typeMap[type] || { color: 'default', text: '其他' }
    return <Tag color={color}>{text}</Tag>
  }

  const getStatusTag = (status?: string) => {
    if (!status) return <Tag>未知</Tag>
    const map: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'default', text: '待处理' },
      QUEUED: { color: 'processing', text: '已入队' },
      SENT: { color: 'success', text: '已发送' },
      FAILED: { color: 'error', text: '失败' },
    }
    const item = map[status] || { color: 'default', text: status }
    return <Tag color={item.color}>{item.text}</Tag>
  }

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: getTypeTag,
    },
    {
      title: '通知内容',
      key: 'content',
      render: (_: any, record: Notification) => (
        <div className={`${record.isRead === 0 ? 'font-medium' : 'text-gray-500'}`}>
          <div className="flex items-center gap-2">
            {getTypeIcon(record.type)}
            <span>{record.title}</span>
            {record.isRead === 0 && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
          <div className="text-sm text-gray-400 mt-1">{record.content}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 100,
      render: (isRead: number) => (
        <Tag color={isRead === 1 ? 'default' : 'blue'}>
          {isRead === 1 ? '已读' : '未读'}
        </Tag>
      ),
    },
    {
      title: '发送状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Notification) => (
        <Space>
          {record.status === 'FAILED' && (
            <Tooltip title="重发">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => handleRetry(record.id)}
              />
            </Tooltip>
          )}
          {record.isRead === 0 && (
            <Tooltip title="标记已读">
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => handleMarkAsRead(record.id)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定删除这条通知吗？"
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

  const unreadCount = notifications.filter((n) => n.isRead === 0).length

  return (
    <div className="page-container">
      <div className="search-bar">
        <div className="flex items-center gap-4">
          <Select
            placeholder="阅读状态"
            value={filters.isRead}
            onChange={(value) => setFilters({ ...filters, isRead: value })}
            style={{ width: 140 }}
            allowClear
          >
            <Select.Option value={0}>未读</Select.Option>
            <Select.Option value={1}>已读</Select.Option>
          </Select>
          <div className="flex-1" />
          {selectedRowKeys.length > 0 && (
            <Button icon={<ReloadOutlined />} onClick={handleRetryBatch}>
              批量重发 ({selectedRowKeys.length})
            </Button>
          )}
          {unreadCount > 0 && (
            <Button icon={<CheckOutlined />} onClick={handleMarkAllAsRead}>
              全部标记已读 ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={notifications}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[]),
          }}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条通知`,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
        />
      </div>
    </div>
  )
}

export default NotificationPage
