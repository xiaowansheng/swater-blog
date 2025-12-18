import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getTagList, createTag, updateTag, deleteTag } from '@/api/tag'
import { Tag } from '@/types'

const TagPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    setLoading(true)
    try {
      const data = await getTagList()
      setTags(data)
    } catch (error) {
      console.error('加载标签失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTag(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    form.setFieldsValue(tag)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTag(id)
      message.success('删除成功')
      loadTags()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingTag) {
        await updateTag(editingTag.id, values)
        message.success('更新成功')
      } else {
        await createTag(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadTags()
    } catch (error) {
      console.error('提交失败', error)
    }
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <span style={{ color, fontWeight: 'bold' }}>{color}</span>
      ),
    },
    { title: '文章数', dataIndex: 'articleCount', key: 'articleCount' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Tag) => (
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
          新建标签
        </Button>
      </div>
      <Table columns={columns} dataSource={tags} rowKey="id" loading={loading} />
      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="color" label="颜色" rules={[{ required: true, message: '请输入颜色' }]}>
            <Input placeholder="#1890ff" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TagPage

