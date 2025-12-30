import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, InputNumber, Tag, Tooltip, Select, Switch, TreeSelect } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getApiList, createApi, updateApi, deleteApi } from '@/api/api'
import { ApiVO } from '@/types/api'

const ApiPage: React.FC = () => {
  const [apis, setApis] = useState<ApiVO[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingApi, setEditingApi] = useState<ApiVO | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadApis()
  }, [])

  const loadApis = async () => {
    setLoading(true)
    try {
      const data = await getApiList()
      setApis(data)
    } catch (error) {
      console.error('加载接口失败', error)
      message.error('加载接口失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = (parentId?: number) => {
    setEditingApi(null)
    form.resetFields()
    if (parentId) {
      form.setFieldsValue({ parentId })
    } else {
      form.setFieldsValue({ parentId: 0 })
    }
    setModalVisible(true)
  }

  const handleEdit = (api: ApiVO) => {
    setEditingApi(api)
    form.setFieldsValue({
      ...api,
      isOpen: api.isOpen === 1
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteApi(id)
      message.success('删除成功')
      loadApis()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = {
        ...values,
        isOpen: values.isOpen ? 1 : 0
      }
      if (editingApi) {
        await updateApi(editingApi.id, data)
        message.success('更新成功')
      } else {
        await createApi(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadApis()
    } catch (error) {
      console.error('提交失败', error)
    }
  }

  const getMethodColor = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'blue'
      case 'POST': return 'green'
      case 'PUT': return 'orange'
      case 'DELETE': return 'red'
      default: return 'default'
    }
  }

  const columns = [
    {
      title: '接口名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ApiVO) => (
        <span className="font-medium">{name}</span>
      ),
    },
    {
      title: '接口路径',
      dataIndex: 'path',
      key: 'path',
      render: (path: string) => path ? <code className="bg-gray-100 px-2 py-1 rounded text-sm">{path}</code> : '-',
    },
    {
      title: '请求方式',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (method: string) => method ? (
        <Tag color={getMethodColor(method)}>{method.toUpperCase()}</Tag>
      ) : '-',
    },
    {
      title: '权限标识',
      dataIndex: 'perms',
      key: 'perms',
      render: (perms: string) => perms ? <Tag color="cyan">{perms}</Tag> : '-',
    },
    {
      title: '公开',
      dataIndex: 'isOpen',
      key: 'isOpen',
      width: 80,
      render: (isOpen: number) => (
        <Tag color={isOpen === 1 ? 'success' : 'default'}>
          {isOpen === 1 ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: ApiVO) => (
        <Space>
          <Tooltip title="添加子接口">
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
            title="确定删除这个接口吗？"
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
      <div className="search-bar flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">接口管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreate()}>
          新建接口
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={apis}
          rowKey="id"
          loading={loading}
          pagination={false}
          childrenColumnName="children"
        />
      </div>

      <Modal
        title={editingApi ? '编辑接口' : '新建接口'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical" initialValues={{ sort: 0, isOpen: false, parentId: 0 }}>
          <Form.Item
            name="name"
            label="接口名称"
            rules={[{ required: true, message: '请输入接口名称' }]}
          >
            <Input placeholder="请输入接口名称，如：文章管理" />
          </Form.Item>
          
          <Form.Item
            name="parentId"
            label="上级接口"
          >
            <TreeSelect
              treeData={[
                { id: 0, name: '根节点', children: [] },
                ...apis
              ]}
              fieldNames={{ label: 'name', value: 'id', children: 'children' }}
              placeholder="请选择上级接口"
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="method"
              label="请求方式"
            >
              <Select placeholder="请选择请求方式" allowClear>
                <Select.Option value="GET">GET</Select.Option>
                <Select.Option value="POST">POST</Select.Option>
                <Select.Option value="PUT">PUT</Select.Option>
                <Select.Option value="DELETE">DELETE</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="sort"
              label="排序"
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            name="path"
            label="接口路径"
          >
            <Input placeholder="请输入接口路径，如：/api/admin/post" />
          </Form.Item>

          <Form.Item
            name="perms"
            label="权限标识"
          >
            <Input placeholder="请输入权限标识，如：admin:post:list" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            name="isOpen"
            label="是否公开"
            valuePropName="checked"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ApiPage
