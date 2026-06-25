import { useState, useEffect, useCallback } from 'react'
import { Form, Input, Button, Switch, Select, Space, Card, message, Popconfirm, Empty, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined, ApiOutlined } from '@ant-design/icons'
import { getWebhookConfig, updateWebhookConfig, WebhookConfig, WebhookItem } from '@/api/config'

const EVENT_OPTIONS = [
  { value: 'article.published', label: '文章发布', color: 'blue' },
  { value: 'comment.created', label: '新评论', color: 'green' },
  { value: 'comment.approved', label: '评论审核通过', color: 'cyan' },
  { value: 'comment.replied', label: '评论回复', color: 'purple' },
]

const WebhookConfigTab: React.FC = () => {
  const [config, setConfig] = useState<WebhookConfig>({ webhooks: [] })
  const [editing, setEditing] = useState<WebhookItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    try {
      const data = await getWebhookConfig()
      setConfig(data || { webhooks: [] })
    } catch {
      setConfig({ webhooks: [] })
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (newConfig: WebhookConfig) => {
    setSaving(true)
    try {
      await updateWebhookConfig(newConfig)
      setConfig(newConfig)
      message.success('保存成功')
    } catch {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const addWebhook = () => {
    setEditing({
      id: Date.now().toString(),
      name: '',
      url: '',
      secret: '',
      events: ['article.published'],
      enabled: true,
    })
    form.resetFields()
  }

  const saveWebhook = async () => {
    try {
      const values = await form.validateFields()
      const updated = editing!.id
      const isNew = !config.webhooks.find(w => w.id === updated)
      let webhooks: WebhookItem[]
      if (isNew) {
        webhooks = [...config.webhooks, { ...values, id: editing!.id }]
      } else {
        webhooks = config.webhooks.map(w => w.id === updated ? { ...w, ...values } : w)
      }
      await save({ webhooks })
      setEditing(null)
    } catch {
      // validation error
    }
  }

  const deleteWebhook = async (id: string) => {
    await save({ webhooks: config.webhooks.filter(w => w.id !== id) })
  }

  const toggleWebhook = async (id: string, enabled: boolean) => {
    await save({
      webhooks: config.webhooks.map(w => w.id === id ? { ...w, enabled } : w)
    })
  }

  return (
    <div className="config-form">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Webhook 配置</h3>
          <p className="text-sm text-gray-400 mt-1">事件发生时向外部 URL 发送 JSON 通知</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={addWebhook} disabled={editing !== null}>
          添加 Webhook
        </Button>
      </div>

      {config.webhooks.length === 0 && !editing && (
        <Empty description="暂无 Webhook 配置" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button type="primary" icon={<PlusOutlined />} onClick={addWebhook}>
            添加第一个 Webhook
          </Button>
        </Empty>
      )}

      {config.webhooks.map((webhook) => (
        <Card key={webhook.id} size="small" className="mb-4" styles={{ body: { padding: '16px' } }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <ApiOutlined className="text-blue-500" />
                <span className="font-semibold text-gray-800">{webhook.name || '未命名'}</span>
                <Switch
                  size="small"
                  checked={webhook.enabled}
                  onChange={(v) => toggleWebhook(webhook.id, v)}
                />
              </div>
              <div className="text-xs text-gray-400 mb-2 truncate max-w-lg">{webhook.url}</div>
              <Space size={[0, 4]} wrap>
                {webhook.events.map((e) => {
                  const opt = EVENT_OPTIONS.find(o => o.value === e)
                  return <Tag key={e} color={opt?.color}>{opt?.label || e}</Tag>
                })}
              </Space>
            </div>
            <div className="flex gap-2">
              <Button size="small" onClick={() => {
                setEditing({ ...webhook })
                form.setFieldsValue(webhook)
              }} disabled={editing !== null}>
                编辑
              </Button>
              <Popconfirm title="确认删除此 Webhook?" onConfirm={() => deleteWebhook(webhook.id)}>
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </div>
          </div>
        </Card>
      ))}

      {editing && (
        <Card size="small" className="mb-4 border-blue-300 bg-blue-50/30" styles={{ body: { padding: '16px' } }}>
          <Form form={form} layout="vertical" initialValues={editing}>
            <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
              <Input placeholder="例如：Slack 通知、CI 构建触发" />
            </Form.Item>
            <Form.Item name="url" label="URL" rules={[
              { required: true, message: '请输入 URL' },
              { type: 'url', message: '请输入有效的 URL' }
            ]}>
              <Input placeholder="https://example.com/webhook" />
            </Form.Item>
            <Form.Item name="secret" label="密钥" help="HMAC-SHA256 签名密钥，接收方可验证请求真实性">
              <Input.Password placeholder="可选，用于签名验证" />
            </Form.Item>
            <Form.Item name="events" label="触发事件" rules={[{ required: true, message: '请选择事件' }]}>
              <Select mode="multiple" options={EVENT_OPTIONS} placeholder="选择触发事件" />
            </Form.Item>
            <div className="flex gap-2">
              <Button type="primary" onClick={saveWebhook} loading={saving}>
                {config.webhooks.find(w => w.id === editing.id) ? '保存修改' : '添加'}
              </Button>
              <Button onClick={() => setEditing(null)}>取消</Button>
            </div>
          </Form>
        </Card>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
        <p className="font-semibold mb-2">支持的事件类型：</p>
        <div className="grid grid-cols-2 gap-2">
          <div><code className="text-blue-600">article.published</code> — 文章发布</div>
          <div><code className="text-green-600">comment.created</code> — 新评论</div>
          <div><code className="text-cyan-600">comment.approved</code> — 评论审核通过</div>
          <div><code className="text-purple-600">comment.replied</code> — 评论被回复</div>
        </div>
        <p className="mt-3">接收端验证签名：<code className="text-gray-600">X-Webhook-Signature: sha256=&lt;HMAC-SHA256(body, secret)&gt;</code></p>
      </div>
    </div>
  )
}

export default WebhookConfigTab
