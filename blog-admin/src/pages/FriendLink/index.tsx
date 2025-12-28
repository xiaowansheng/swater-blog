import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, Tag, Avatar, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons'
import { getFriendLinkList, createFriendLink, updateFriendLink, deleteFriendLink } from '@/api/friendLink'
import { FriendLink } from '@/types'

const FriendLinkPage: React.FC = () => {
  const [links, setLinks] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingLink, setEditingLink] = useState<FriendLink | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    setLoading(true)
    try {
      const data = await getFriendLinkList()
      setLinks(data)
    } catch (error) {
      console.error('加载友链失败', error)
    } finally {
      setLoading(false)
    }
  }

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
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'warning'}>
          {status === 1 ? '已审核' : '待审核'}
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
      width: 150,
      render: (_: any, record: FriendLink) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这个友链吗？"
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
        <h2 className="text-lg font-medium">友链管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建友链
        </Button>
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
      >
        <Form form={form} layout="vertical">
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
          <Form.Item name="description" label="网站描述">
            <Input.TextArea rows={3} placeholder="请输入网站描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default FriendLinkPage
