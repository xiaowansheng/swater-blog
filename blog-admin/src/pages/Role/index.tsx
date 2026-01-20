import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, Tag, Tooltip, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ApiOutlined, SearchOutlined } from '@ant-design/icons'
import { getRoleList, createRole, updateRole, deleteRole } from '@/api/role'
import { Role } from '@/types'
import ApiAuthModal from './ApiAuthModal'

const RolePage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [apiAuthVisible, setApiAuthVisible] = useState(false)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [form] = Form.useForm()
  const [filters, setFilters] = useState<{
    name: string
    roleKey: string
    status: number | undefined
  }>({
    name: '',
    roleKey: '',
    status: undefined,
  })


  const loadRoles = async () => {
    setLoading(true)
    try {
      const data = await getRoleList()

      let filtered = data
      if (filters.name) {
        filtered = filtered.filter((role: Role) =>
          role.name.toLowerCase().includes(filters.name.toLowerCase())
        )
      }
      if (filters.roleKey) {
        filtered = filtered.filter((role: Role) =>
          role.roleKey.toLowerCase().includes(filters.roleKey.toLowerCase())
        )
      }
      if (filters.status !== undefined) {
        filtered = filtered.filter((role: Role) => role.status === filters.status)
      }
      setRoles(filtered)
    } catch (error) {
      console.error('加载角色失败', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [filters])

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

  const handleApiAuth = (role: Role) => {
    setCurrentRole(role)
    setApiAuthVisible(true)
  }

  const handleApiAuthSuccess = () => {
    loadRoles()
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
      title: '角色标签',
      dataIndex: 'roleKey',
      key: 'roleKey',
      render: (roleKey: string) => <Tag color="blue">{roleKey}</Tag>,
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
          <Tooltip title="API授权">
            <Button
              type="text"
              icon={<ApiOutlined />}
              onClick={() => handleApiAuth(record)}
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
      <div className="search-bar">
        <div className="flex gap-4 items-center flex-wrap">
          <Input
            placeholder="角色名称"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            style={{ width: 160 }}
            allowClear
          />
          <Input
            placeholder="角色标签"
            value={filters.roleKey}
            onChange={(e) => setFilters({ ...filters, roleKey: e.target.value })}
            style={{ width: 140 }}
            allowClear
          />
          <Select
            placeholder="状态"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 100 }}
            allowClear
          >
            <Select.Option value={1}>启用</Select.Option>
            <Select.Option value={0}>禁用</Select.Option>
          </Select>
          <div className="flex-1" />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建角色
          </Button>
        </div>
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
            name="roleKey"
            label="角色标签"
            rules={[{ required: true, message: '请输入角色标签' }]}
          >
            <Input placeholder="请输入角色标签，如 admin" disabled={!!editingRole} />
          </Form.Item>
          <Form.Item name="description" label="角色描述">
            <Input.TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>
        </Form>
      </Modal>

      <ApiAuthModal
        visible={apiAuthVisible}
        roleId={currentRole?.id || null}
        roleName={currentRole?.name || ''}
        onCancel={() => setApiAuthVisible(false)}
        onSuccess={handleApiAuthSuccess}
      />
    </div>
  )
}

export default RolePage
