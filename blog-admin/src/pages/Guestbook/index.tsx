import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Select, Tag, Avatar, Tooltip } from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  getGuestbookList,
  approveGuestbook,
  rejectGuestbook,
  deleteGuestbook,
  deleteBatchGuestbook,
} from '@/api/guestbook'
import { Guestbook } from '@/types'
import { getFullUrl } from '@/utils/format'

const GuestbookPage: React.FC = () => {
  const [guestbooks, setGuestbooks] = useState<Guestbook[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState<{ status: number | undefined }>({ status: undefined })

  useEffect(() => {
    loadGuestbooks()
  }, [pagination.current, pagination.pageSize, filters])

  const loadGuestbooks = async () => {
    setLoading(true)
    try {
      const result = await getGuestbookList({
        page: pagination.current,
        size: pagination.pageSize,
        ...filters,
      })
      setGuestbooks(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('加载留言失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await approveGuestbook(id)
      message.success('审核通过')
      loadGuestbooks()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await rejectGuestbook(id)
      message.success('已拒绝')
      loadGuestbooks()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteGuestbook(id)
      message.success('删除成功')
      loadGuestbooks()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleBatchDelete = async () => {
    try {
      await deleteBatchGuestbook(selectedRowKeys as number[])
      message.success('批量删除成功')
      setSelectedRowKeys([])
      loadGuestbooks()
    } catch (error) {
      message.error('批量删除失败')
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
      title: '访客信息',
      key: 'visitor',
      width: 200,
      render: (_: any, record: Guestbook) => (
        <div className="flex items-center gap-3">
          <Avatar src={getFullUrl(record.avatar)} icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.nickname}</div>
            <div className="text-xs text-gray-400">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '留言内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (location: string) => location || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: getStatusTag,
    },
    {
      title: '留言时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: Guestbook) => (
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
          <Popconfirm title="确定删除这条留言吗？" onConfirm={() => handleDelete(record.id)}>
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
          <Select
            placeholder="留言状态"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 140 }}
            allowClear
          >
            <Select.Option value={0}>待审核</Select.Option>
            <Select.Option value={1}>已通过</Select.Option>
            <Select.Option value={2}>已拒绝</Select.Option>
          </Select>
          <div className="flex-1" />
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`确定删除选中的 ${selectedRowKeys.length} 条留言吗？`}
              onConfirm={handleBatchDelete}
            >
              <Button danger>批量删除 ({selectedRowKeys.length})</Button>
            </Popconfirm>
          )}
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={guestbooks}
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
            showTotal: (total) => `共 ${total} 条留言`,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
        />
      </div>
    </div>
  )
}

export default GuestbookPage
