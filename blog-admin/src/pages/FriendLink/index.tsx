import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getFriendLinkList, createFriendLink, updateFriendLink, deleteFriendLink } from '@/api/friendLink'
import { FriendLink } from '@/types'
import { formatDate } from '@/utils/format'

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
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: 'URL', dataIndex: 'url', key: 'url' },
    { title: 'Logo', dataIndex: 'logo', key: 'logo' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (status === 1 ? '已审核' : '待审核'),
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', render: formatDate },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: FriendLink) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建友链
        </Button>
      </div>
      <Table columns={columns} dataSource={links} rowKey="id" loading={loading} />
      <Modal
        title={editingLink ? '编辑友链' : '新建友链'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true, message: '请输入URL' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="logo" label="Logo">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default FriendLinkPage

