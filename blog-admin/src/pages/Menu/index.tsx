import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, InputNumber, Tag, Tooltip, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getMenuList, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import { Menu } from '@/types'

const MenuPage: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadMenus()
  }, [])

  const loadMenus = async () => {
    setLoading(true)
    try {
      const data = await getMenuList()
      setMenus(data)
    } catch (error) {
      console.error('加载菜单失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = (parentId?: number) => {
    setEditingMenu(null)
    form.resetFields()
    if (parentId) {
      form.setFieldsValue({ parentId })
    }
    setModalVisible(true)
  }

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu)
    form.setFieldsValue(menu)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMenu(id)
      message.success('删除成功')
      loadMenus()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingMenu) {
        await updateMenu(editingMenu.id, values)
        message.success('更新成功')
      } else {
        await createMenu(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadMenus()
    } catch (error) {
      console.error('提交失败', error)
    }
  }

  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Menu) => (
        <div className="flex items-center gap-2">
          {record.icon && <span>{record.icon}</span>}
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: '路由路径',
      dataIndex: 'path',
      key: 'path',
      render: (path: string) => <code className="bg-gray-100 px-2 py-1 rounded text-sm">{path}</code>,
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      key: 'component',
      ellipsis: true,
      render: (component: string) => component || '-',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '可见',
      dataIndex: 'visible',
      key: 'visible',
      width: 80,
      render: (visible: number) => (
        <Tag color={visible === 1 ? 'success' : 'default'}>
          {visible === 1 ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'error'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Menu) => (
        <Space>
          <Tooltip title="添加子菜单">
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => handleCreate(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这个菜单吗？"
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
        <h2 className="text-lg font-medium">菜单管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreate()}>
          新建菜单
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={menus}
          rowKey="id"
          loading={loading}
          pagination={false}
          childrenColumnName="children"
          defaultExpandAllRows
        />
      </div>

      <Modal
        title={editingMenu ? '编辑菜单' : '新建菜单'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>
          <Form.Item
            name="path"
            label="路由路径"
            rules={[{ required: true, message: '请输入路由路径' }]}
          >
            <Input placeholder="请输入路由路径，如 /dashboard" />
          </Form.Item>
          <Form.Item name="component" label="组件路径">
            <Input placeholder="请输入组件路径" />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input placeholder="请输入图标名称" />
          </Form.Item>
          <Form.Item name="parentId" label="父级菜单">
            <InputNumber placeholder="父级菜单ID" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber placeholder="排序值" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="visible" label="是否可见" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MenuPage
