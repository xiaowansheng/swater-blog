import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, InputNumber, Tag, Tooltip, Select, Switch, TreeSelect, ModalProps, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { getApiList, createApi, updateApi, deleteApi, refreshApi } from '@/api/api'
import { ApiVO, ApiRefreshResultVO } from '@/types/api'

const ApiPage: React.FC = () => {
  const [apis, setApis] = useState<ApiVO[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingApi, setEditingApi] = useState<ApiVO | null>(null)
  const [refreshResultVisible, setRefreshResultVisible] = useState(false)
  const [refreshResult, setRefreshResult] = useState<ApiRefreshResultVO | null>(null)
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

  const handleRefresh = async () => {
    Modal.confirm({
      title: '确认刷新接口',
      icon: <InfoCircleOutlined />,
      content: (
        <div>
          <p>刷新接口将会自动扫描系统中的所有接口并同步到数据库。</p>
          <p>此操作可能会覆盖手动修改的接口信息，确定要继续吗？</p>
        </div>
      ),
      okText: '确认刷新',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        setLoading(true)
        try {
          const result = await refreshApi()
          console.log('刷新结果:', result)
          setRefreshResult(result)
          setRefreshResultVisible(true)
          message.success('接口刷新成功')
          loadApis()
        } catch (error) {
          console.error('刷新接口失败', error)
          message.error('刷新接口失败')
        } finally {
          setLoading(false)
        }
      }
    })
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
        <Space>
          <Tooltip title="自动扫描并同步系统接口到数据库（重要操作）">
            <Button
              icon={<ReloadOutlined spin={loading} />}
              onClick={handleRefresh}
              type="default"
              style={{
                borderColor: '#faad14',
                color: '#faad14',
                fontWeight: 500
              }}
            >
              刷新接口
            </Button>
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreate()}>
            新建接口
          </Button>
        </Space>
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

      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>接口刷新结果</span>
          </Space>
        }
        open={refreshResultVisible}
        onCancel={() => setRefreshResultVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setRefreshResultVisible(false)}>
            关闭
          </Button>
        ]}
        width={500}
      >
        {refreshResult ? (
          <div>
            {refreshResult.total === 0 ? (
              // 空状态：没有任何更新
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <p style={{ fontSize: 16, color: '#52c41a', marginBottom: 8 }}>系统接口已是最新</p>
                      <p style={{ color: '#999', margin: 0 }}>没有检测到需要更新的接口</p>
                    </div>
                  }
                />
                <div style={{ marginTop: 24, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, display: 'inline-block' }}>
                  <Space>
                    <span style={{ color: '#52c41a' }}>执行耗时：{refreshResult.executionTime} ms</span>
                  </Space>
                </div>
              </div>
            ) : (
              // 有更新的情况
              <div>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>刷新统计</p>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {refreshResult.createdModules > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>新增模块：</span>
                        <Tag color="green">{refreshResult.createdModules} 个</Tag>
                      </div>
                    )}
                    {refreshResult.updatedModules > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>更新模块：</span>
                        <Tag color="blue">{refreshResult.updatedModules} 个</Tag>
                      </div>
                    )}
                    {refreshResult.createdApis > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>新增接口：</span>
                        <Tag color="green">{refreshResult.createdApis} 个</Tag>
                      </div>
                    )}
                    {refreshResult.updatedApis > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>更新接口：</span>
                        <Tag color="blue">{refreshResult.updatedApis} 个</Tag>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                      <span style={{ fontWeight: 'bold' }}>总计处理：</span>
                      <Tag color="purple" style={{ fontSize: 14, fontWeight: 'bold' }}>{refreshResult.total} 项</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>执行耗时：</span>
                      <span style={{ color: '#666' }}>{refreshResult.executionTime} ms</span>
                    </div>
                  </Space>
                </div>
                <div style={{ padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                  <p style={{ margin: 0, color: '#52c41a' }}>{refreshResult.message}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Empty description="加载中..." />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ApiPage
