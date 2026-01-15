import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  Tag,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  KeyOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { getUserList, createUser, updateUser, deleteUser, resetPassword } from '@/api/user'
import { getRoleList } from '@/api/role'
import { User, Role } from '@/types'
import { formatDate, getFullUrl } from '@/utils/format'

const { Option } = Select

const UserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState<{
    username: string
    nickname: string
    email: string
    roleId: number | undefined
    status: number | undefined
  }>({
    username: '',
    nickname: '',
    email: '',
    roleId: undefined,
    status: undefined,
  })

  useEffect(() => {
    loadRoles()
  }, [])

  useEffect(() => {
    loadUsers()
  }, [pagination.current, pagination.pageSize])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    loadUsers()
  }, [filters])

  const loadRoles = async () => {
    try {
      const data = await getRoleList()
      setRoles(data)
    } catch (error) {
      console.error('加载角色失败', error)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const result = await getUserList({
        page: pagination.current,
        size: pagination.pageSize,
        username: filters.username || undefined,
        nickname: filters.nickname || undefined,
        email: filters.email || undefined,
        roleId: filters.roleId,
        status: filters.status,
      })
      setUsers(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('加载用户失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue({
      ...user,
      roleIds: user.roles?.map((r) => r.id) || [],
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id)
      message.success('删除成功')
      loadUsers()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingUser) {
        await updateUser(editingUser.id, values)
        message.success('更新成功')
      } else {
        await createUser(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadUsers()
    } catch (error) {
      console.error('提交失败', error)
    }
  }

  const handleResetPassword = (userId: number) => {
    setSelectedUserId(userId)
    passwordForm.resetFields()
    setPasswordModalVisible(true)
  }

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields()
      if (selectedUserId) {
        await resetPassword(selectedUserId, values.password)
        message.success('密码重置成功')
        setPasswordModalVisible(false)
      }
    } catch (error) {
      message.error('密码重置失败')
    }
  }

  const columns = [
    {
      title: '用户信息',
      key: 'info',
      width: 250,
      render: (_: any, record: User) => (
        <div className="flex items-center gap-3">
          <Avatar src={getFullUrl(record.avatar)} icon={<UserOutlined />} size={40} />
          <div>
            <div className="font-medium">{record.nickname || record.username}</div>
            <div className="text-xs text-gray-400">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 200,
      render: (roles: Role[]) => (
        <div className="flex flex-wrap gap-1">
          {roles?.map((r) => (
            <Tag key={r.id} color="blue">
              {r.name}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'error'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 160,
      render: (time: string) => (time ? formatDate(time) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="重置密码">
            <Button
              type="text"
              icon={<KeyOutlined />}
              onClick={() => handleResetPassword(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这个用户吗？"
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
            placeholder="用户名"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.username}
            onChange={(e) => setFilters({ ...filters, username: e.target.value })}
            style={{ width: 160 }}
            allowClear
          />
          <Input
            placeholder="昵称"
            value={filters.nickname}
            onChange={(e) => setFilters({ ...filters, nickname: e.target.value })}
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
          <Select
            placeholder="角色"
            value={filters.roleId}
            onChange={(value) => setFilters({ ...filters, roleId: value })}
            style={{ width: 140 }}
            allowClear
          >
            {roles.map((role) => (
              <Select.Option key={role.id} value={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="状态"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 100 }}
            allowClear
          >
            <Select.Option value={1}>正常</Select.Option>
            <Select.Option value={0}>禁用</Select.Option>
          </Select>
          <div className="flex-1" />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建用户
          </Button>
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个用户`,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
        />
      </div>

      {/* 用户表单弹窗 */}
      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item name="roleIds" label="角色">
            <Select mode="multiple" placeholder="请选择角色">
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 重置密码弹窗 */}
      <Modal
        title="重置密码"
        open={passwordModalVisible}
        onOk={handlePasswordSubmit}
        onCancel={() => setPasswordModalVisible(false)}
        width={400}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserPage
