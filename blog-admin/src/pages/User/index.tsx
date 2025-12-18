import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'
import { getRoleList } from '@/api/role'
import { User, Role } from '@/types'

const UserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    loadRoles()
    loadUsers()
  }, [pagination.current, pagination.pageSize])

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
      })
      setUsers(result.records)
      setPagination({ ...pagination, total: result.total })
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
      roleIds: user.roles.map((r) => r.id),
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

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: Role[]) => roles.map((r) => r.name).join(', '),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
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
          新建用户
        </Button>
      </div>
      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
      }} />
      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="roleIds" label="角色">
            <Select mode="multiple">
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserPage

