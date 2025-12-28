import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, Tag } from 'antd'
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
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => desc || <span className="text-gray-400">暂无描述</span>,
    },
    {
      title: '文章数',
      dataIndex: 'articleCount',
      key: 'articleCount',
      width: 100,
      render: (count: number) => (
        <Tag color="blue">{count || 0} 篇</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除这个分类吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="search-bar flex justify-between items-center">
        <h2 className="text-lg font-medium">分类管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建分类
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </div>

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="description" label="分类描述">
            <Input.TextArea rows={3} placeholder="请输入分类描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CategoryPage
