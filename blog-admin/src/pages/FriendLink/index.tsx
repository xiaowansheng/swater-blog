import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, Tag, Avatar, Tooltip, InputNumber, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined, SearchOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { getFriendLinkList, createFriendLink, updateFriendLink, deleteFriendLink, approveFriendLink, rejectFriendLink } from '@/api/friendLink'
import { FriendLink } from '@/types'

const FriendLinkPage: React.FC = () => {
  const [links, setLinks] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingLink, setEditingLink] = useState<FriendLink | null>(null)
  const [form] = Form.useForm()
  const [filters, setFilters] = useState<{
    id: number | undefined
    userId: number | undefined
    name: string
    author: string
    email: string
    url: string
    reviewStatus: number | undefined
    isVisible: number | undefined
  }>({
    id: undefined,
    userId: undefined,
    name: '',
    author: '',
    email: '',
    url: '',
    reviewStatus: undefined,
    isVisible: undefined,
  })


  const loadLinks = async () => {
    setLoading(true)
    try {
      const data = await getFriendLinkList({
        id: filters.id,
        userId: filters.userId,
        name: filters.name,
        author: filters.author,
        email: filters.email,
        url: filters.url,
        reviewStatus: filters.reviewStatus,
        isVisible: filters.isVisible,
      })
      setLinks(data)
    } catch (error) {
      console.error('加载友链失败', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLinks()
  }, [filters])

  const handleCreate = () => {
    setEditingLink(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (link: FriendLink) => {
    setEditingLink(link)
    form.setFieldsValue(link)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteFriendLink(id)
      message.success('删除成功')
      loadLinks()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await approveFriendLink(id)
      message.success('审核通过')
      loadLinks()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await rejectFriendLink(id)
      message.success('已拒绝')
      loadLinks()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingLink) {
        await updateFriendLink(editingLink.id, values)
        message.success('更新成功')
      } else {
        await createFriendLink(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadLinks()
    } catch (error) {
      console.error('提交失败', error)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '序号',
      key: 'index',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '友链信息',
      key: 'info',
      width: 300,
      render: (_: any, record: FriendLink) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.logo}
            icon={<LinkOutlined />}
            size={40}
            className="bg-blue-100"
          />
          <div>
            <div className="font-medium">{record.name}</div>
            <a
              href={record.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              {record.url}
            </a>
          </div>
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => desc || <span className="text-gray-400">暂无描述</span>,
    },
    {
      title: '状态',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
      width: 100,
      render: (reviewStatus: number) => {
        const statusConfig = {
          0: { text: '待审核', color: 'warning' },
          1: { text: '已审核', color: 'success' },
          2: { text: '已拒绝', color: 'error' },
        }
        const config = statusConfig[reviewStatus as keyof typeof statusConfig] || { text: '未知', color: 'default' }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '可见状态',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 100,
      render: (isVisible: number) => (
        <Tag color={isVisible === 1 ? 'processing' : 'default'}>
          {isVisible === 1 ? '可见' : '不可见'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: FriendLink) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          {record.reviewStatus === 0 && (
            <>
              <Popconfirm
                title="确定通过这条友链申请吗？"
                onConfirm={() => handleApprove(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Tooltip title="通过">
                  <Button
                    type="text"
                    icon={<CheckOutlined />}
                    style={{ color: 'rgb(82, 196, 26)' }}
                  />
                </Tooltip>
              </Popconfirm>
              <Popconfirm
                title="确定拒绝这条友链申请吗？"
                onConfirm={() => handleReject(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Tooltip title="拒绝">
                  <Button
                    type="text"
                    danger
                    icon={<CloseOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}

          {record.reviewStatus === 2 && (
            <Popconfirm
              title="确定通过这条友链申请吗？"
              onConfirm={() => handleApprove(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="通过">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  style={{ color: 'rgb(82, 196, 26)' }}
                />
              </Tooltip>
            </Popconfirm>
          )}

          <Popconfirm
            title="确定删除这个友链吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
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
        <div className="flex gap-4 items-center flex-wrap">
          <Input
            placeholder="网站名称"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            style={{ width: 180 }}
            allowClear
          />
          <Input
            placeholder="作者"
            value={filters.author}
            onChange={(e) => setFilters({ ...filters, author: e.target.value })}
            style={{ width: 140 }}
            allowClear
          />
          <Input
            placeholder="邮箱"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            style={{ width: 180 }}
            allowClear
          />
          <Input
            placeholder="链接地址"
            value={filters.url}
            onChange={(e) => setFilters({ ...filters, url: e.target.value })}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="状态"
            value={filters.reviewStatus}
            onChange={(value) => setFilters({ ...filters, reviewStatus: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={0}>待审核</Select.Option>
            <Select.Option value={1}>已审核</Select.Option>
            <Select.Option value={2}>已拒绝</Select.Option>
          </Select>
          <Select
            placeholder="可见状态"
            value={filters.isVisible}
            onChange={(value) => setFilters({ ...filters, isVisible: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={1}>可见</Select.Option>
            <Select.Option value={0}>不可见</Select.Option>
          </Select>
          <Input
            placeholder="友链ID"
            value={filters.id ?? ''}
            onChange={(e) => setFilters({ ...filters, id: e.target.value ? Number(e.target.value) : undefined })}
            style={{ width: 120 }}
            type="number"
            allowClear
          />
          <Input
            placeholder="用户ID"
            value={filters.userId ?? ''}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value ? Number(e.target.value) : undefined })}
            style={{ width: 120 }}
            type="number"
            allowClear
          />
          <div className="flex-1" />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建友链
          </Button>
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={links}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </div>

      <Modal
        title={editingLink ? '编辑友链' : '新建友链'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
        styles={{ body: { maxHeight: '60vh', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical" style={{ padding: '24px' }}>
          <Form.Item
            name="name"
            label="网站名称"
            rules={[{ required: true, message: '请输入网站名称' }]}
          >
            <Input placeholder="请输入网站名称" />
          </Form.Item>
          <Form.Item
            name="url"
            label="网站地址"
            rules={[
              { required: true, message: '请输入网站地址' },
              { type: 'url', message: '请输入有效的URL' },
            ]}
          >
            <Input placeholder="请输入网站地址，如 https://example.com" />
          </Form.Item>
          <Form.Item name="logo" label="网站Logo">
            <Input placeholder="请输入Logo图片URL" />
          </Form.Item>
          <Form.Item
            name="author"
            label="作者"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input placeholder="请输入作者名称" />
          </Form.Item>
          <Form.Item name="description" label="网站描述">
            <Input.TextArea rows={3} placeholder="请输入网站描述" />
          </Form.Item>
          <Form.Item
            name="sort"
            label="排序"
            initialValue={9999}
          >
            <InputNumber min={0} placeholder="请输入排序值，数字越小越靠前" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="reviewStatus"
            label="审核状态"
            initialValue={0}
          >
            <Select>
              <Select.Option value={0}>待审核</Select.Option>
              <Select.Option value={1}>已审核</Select.Option>
              <Select.Option value={2}>已拒绝</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="isVisible"
            label="可见状态"
            initialValue={0}
          >
            <Select>
              <Select.Option value={0}>不可见</Select.Option>
              <Select.Option value={1}>可见</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default FriendLinkPage
