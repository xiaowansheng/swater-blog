import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getCategoryList, createCategory, updateCategory, deleteCategory } from '@/api/category'
import { Category } from '@/types'

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = await getCategoryList()
      setCategories(data)
    } catch (error) {
      console.error('加载分类失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCategory(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    form.setFieldsValue(category)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id)
      message.success('删除成功')
      loadCategories()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingCategory) {
        await updateCategory(editingCategory.id, values)
        message.success('更新成功')
      } else {
        await createCategory(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadCategories()
    } catch (error) {
      console.error('提交失败', error)
    }
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '文章数', dataIndex: 'articleCount', key: 'articleCount' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Category) => (
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
          新建分类
        </Button>
      </div>
      <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} />
      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
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

export default CategoryPage

