import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, Tag, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons'
import { getRoleList, createRole, updateRole, deleteRole } from '@/api/role'
import { Role } from '@/types'

const RolePage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    setLoading(true)
    try {
      const data = await getRoleList()
      setRoles(data)
    } catch (error) {
      console.error('加载角色失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingRole(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    form.setFieldsValue(role)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id)
      message.success('删除成功')
      loadRoles()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRole) {
        await updateRole(editingRole.id, values)
        message.success('更新成功')
      } else {
        await createRole(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadRoles()
    } catch (error) {
      console.error('提交失败', error)
    }
  }

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
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
        <Tag color={status === 1 ? 'success' : 'default'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Role) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="权限配置">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => message.info('权限配置功能开发中')}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这个角色吗？"
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
        <h2 className="text-lg font-medium">角色管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建角色
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </div>

      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色编码"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="请输入角色编码，如 admin" disabled={!!editingRole} />
          </Form.Item>
          <Form.Item name="description" label="角色描述">
            <Input.TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RolePage
