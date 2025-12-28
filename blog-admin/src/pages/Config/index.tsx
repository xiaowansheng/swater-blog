import { useState, useEffect } from 'react'
import { Table, Button, message, Modal, Form, Input, Tag, Tabs, Card, Tooltip } from 'antd'
import { EditOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons'
import { getConfigList, updateConfig } from '@/api/config'
import { SysConfig } from '@/types'

const ConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<SysConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingConfig, setEditingConfig] = useState<SysConfig | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    setLoading(true)
    try {
      const data = await getConfigList()
      setConfigs(data)
    } catch (error) {
      console.error('加载配置失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (config: SysConfig) => {
    setEditingConfig(config)
    form.setFieldsValue(config)
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingConfig) {
        await updateConfig(editingConfig.configKey, values.configValue)
        message.success('更新成功')
        setModalVisible(false)
        loadConfigs()
      }
    } catch (error) {
      console.error('提交失败', error)
    }
  }

  // 按类型分组配置
  const groupedConfigs = configs.reduce((acc, config) => {
    const type = config.configType || '其他'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(config)
    return acc
  }, {} as Record<string, SysConfig[]>)

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      site: 'blue',
      email: 'green',
      storage: 'purple',
      security: 'red',
      other: 'default',
    }
    return colorMap[type] || 'default'
  }

  const columns = [
    {
      title: '配置键',
      dataIndex: 'configKey',
      key: 'configKey',
      width: 200,
      render: (key: string) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{key}</code>
      ),
    },
    {
      title: '配置值',
      dataIndex: 'configValue',
      key: 'configValue',
      ellipsis: true,
      render: (value: string) => (
        <span className="text-gray-700">{value || '-'}</span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => desc || <span className="text-gray-400">暂无描述</span>,
    },
    {
      title: '类型',
      dataIndex: 'configType',
      key: 'configType',
      width: 100,
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{type || '其他'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: SysConfig) => (
        <Tooltip title="编辑">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>
      ),
    },
  ]

  const tabItems = Object.entries(groupedConfigs).map(([type, items]) => ({
    key: type,
    label: (
      <span>
        {type} <Tag size="small">{items.length}</Tag>
      </span>
    ),
    children: (
      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
      />
    ),
  }))

  return (
    <div className="page-container">
      <div className="search-bar flex justify-between items-center">
        <h2 className="text-lg font-medium">系统配置</h2>
        <Button icon={<ReloadOutlined />} onClick={loadConfigs}>
          刷新
        </Button>
      </div>

      <Card className="chart-card">
        {Object.keys(groupedConfigs).length > 1 ? (
          <Tabs items={tabItems} />
        ) : (
          <Table
            columns={columns}
            dataSource={configs}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        )}
      </Card>

      <Modal
        title="编辑配置"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="configKey" label="配置键">
            <Input disabled />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="configValue"
            label="配置值"
            rules={[{ required: true, message: '请输入配置值' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入配置值" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ConfigPage
