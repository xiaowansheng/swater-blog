import { useState, useEffect } from 'react'
import { Table, Button, message, Modal, Form, Input } from 'antd'
import { getConfigList, updateConfig } from '@/api/config'
import { Config } from '@/api/config'

const ConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<Config[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingConfig, setEditingConfig] = useState<Config | null>(null)
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

  const handleEdit = (config: Config) => {
    setEditingConfig(config)
    form.setFieldsValue(config)
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingConfig) {
        await updateConfig(editingConfig.key, values.value)
        message.success('更新成功')
        setModalVisible(false)
        loadConfigs()
      }
    } catch (error) {
      console.error('提交失败', error)
    }
  }

  const columns = [
    { title: '键', dataIndex: 'key', key: 'key' },
    { title: '值', dataIndex: 'value', key: 'value' },
    { title: '分组', dataIndex: 'groupName', key: 'groupName' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Config) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          编辑
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Table columns={columns} dataSource={configs} rowKey="key" loading={loading} />
      <Modal
        title="编辑配置"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="key" label="键">
            <Input disabled />
          </Form.Item>
          <Form.Item name="value" label="值" rules={[{ required: true, message: '请输入值' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ConfigPage

