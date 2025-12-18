import { useState, useEffect } from 'react'
import { Table, Button, Space, message } from 'antd'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/api/notification'
import { useNotificationStore } from '@/store/notification'
import { useAuthStore } from '@/store/auth'
import { Notification } from '@/types'
import { formatDate } from '@/utils/format'

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const { setNotifications: setStoreNotifications, markAsRead: markStoreAsRead } = useNotificationStore()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    loadNotifications()
  }, [pagination.current, pagination.pageSize])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const result = await getNotifications({
        page: pagination.current,
        size: pagination.pageSize,
      })
      setNotifications(result.records)
      setStoreNotifications(result.records)
      setPagination({ ...pagination, total: result.total })
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
      loadNotifications()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    try {
      await markAllAsRead(user.id)
      loadNotifications()
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

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '内容', dataIndex: 'content', key: 'content' },
    {
      title: '状态',
      dataIndex: 'isRead',
      key: 'isRead',
      render: (isRead: number) => (isRead === 1 ? '已读' : '未读'),
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', render: formatDate },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Notification) => (
        <Space>
          {record.isRead === 0 && (
            <Button type="link" onClick={() => handleMarkAsRead(record.id)}>
              标记已读
            </Button>
          )}
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4">
        <Button onClick={handleMarkAllAsRead}>全部标记已读</Button>
      </div>
      <Table
        columns={columns}
        dataSource={notifications}
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

export default NotificationPage

