import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
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
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '编码', dataIndex: 'code', key: 'code' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Role) => (
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
          新建角色
        </Button>
      </div>
      <Table columns={columns} dataSource={roles} rowKey="id" loading={loading} />
      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="编码" rules={[{ required: true, message: '请输入编码' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RolePage

