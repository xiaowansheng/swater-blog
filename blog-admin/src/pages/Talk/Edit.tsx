import { useState, useEffect, useCallback } from 'react'
import { Form, Button, message, Card, Switch, Radio, Space } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined, SendOutlined, SaveOutlined } from '@ant-design/icons'
import { createTalk, updateTalk, getTalkById } from '@/api/talk'
import { TalkStatus } from '@/types'
import RichTextEditor from '@/components/common/RichTextEditor'
import MultiImageUpload from '@/components/common/MultiImageUpload'
import TalkSaveStatus from '@/components/talk/TalkSaveStatus'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const TalkEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const status = Form.useWatch('status', form)

  // 保存状态
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSavedTime, setLastSavedTime] = useState<Date>()
  const [errorMessage, setErrorMessage] = useState<string>()

  const isEdit = !!id

  useEffect(() => {
    if (isEdit) {
      loadTalk()
    } else {
      form.setFieldsValue({
        status: TalkStatus.PUBLISHED,
        isTop: false,
        images: []
      })
    }
  }, [id])

  const loadTalk = async () => {
    setLoading(true)
    try {
      const talk = await getTalkById(Number(id))
      form.setFieldsValue({
        ...talk,
        isTop: talk.isTop === 1,
        images: talk.images || []
      })
      // 设置已保存状态
      setSaveStatus('saved')
      setLastSavedTime(new Date(talk.updateTime || talk.createTime))
    } catch (error) {
      message.error('加载说说失败')
      navigate('/talk')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    setSubmitting(true)
    setSaveStatus('saving')
    try {
      const data = {
        ...values,
        isTop: values.isTop ? 1 : 0,
      }

      if (isEdit) {
        await updateTalk(Number(id), data)
        message.success('更新成功')
      } else {
        await createTalk(data)
        message.success('发布成功')
      }

      setSaveStatus('saved')
      setLastSavedTime(new Date())

      // 等待一小段时间让用户看到保存成功状态
      setTimeout(() => {
        navigate('/talk')
      }, 300)
    } catch (error) {
      console.error('提交失败', error)
      message.error('操作失败')
      setSaveStatus('error')
      setErrorMessage('操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      setSaveStatus('saving')
      setErrorMessage(undefined)

      const data = {
        ...values,
        isTop: values.isTop ? 1 : 0,
        status: TalkStatus.DRAFT, // 保存按钮固定保存为草稿
      }

      if (isEdit) {
        await updateTalk(Number(id), data)
        message.success('保存成功')
      } else {
        const newId = await createTalk(data)
        message.success('保存成功')
        // 保存后跳转到编辑页面，以便继续编辑
        if (!id && newId) {
          navigate(`/talk/edit/${newId}`, { replace: true })
        }
      }

      setSaveStatus('saved')
      setLastSavedTime(new Date())
    } catch (error) {
      if (error?.errorFields) {
        message.warning('请填写必填项')
        setSaveStatus('idle')
      } else {
        console.error('保存失败', error)
        message.error('保存失败')
        setSaveStatus('error')
        setErrorMessage('保存失败，请重试')
      }
    } finally {
      setSubmitting(false)
    }
  }, [form, isEdit, id, navigate])

  // 快捷键保存 Ctrl+S 或 Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleSave])

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/talk')}
          >
            返回列表
          </Button>
          <h2 className="text-xl font-semibold m-0">
            {isEdit ? '编辑说说' : '发布说说'}
          </h2>
        </div>
        <Space>
          <TalkSaveStatus
            status={saveStatus}
            lastSavedTime={lastSavedTime}
            errorMessage={errorMessage}
          />
          <Button
            icon={<SaveOutlined />}
            loading={submitting}
            onClick={handleSave}
          >
            保存草稿 (Ctrl+S)
          </Button>
          <Button
            type="primary"
            loading={submitting}
            icon={<SendOutlined />}
            onClick={() => form.submit()}
          >
            {isEdit ? '保存修改' : '立即发布'}
          </Button>
        </Space>
      </div>

      <Card loading={loading} className="shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: TalkStatus.PUBLISHED, isTop: false }}
        >
          <Form.Item
            name="content"
            label="说说内容"
            rules={[{ required: true, message: '请输入说说内容' }]}
          >
            <RichTextEditor height={300} placeholder="分享你的想法..." />
          </Form.Item>

          <Form.Item
            name="images"
            label="说说图片"
            tooltip="支持上传多张图片，点击可预览"
          >
            <MultiImageUpload maxCount={9} />
          </Form.Item>

          <div className="flex gap-8">
            <Form.Item
              name="isTop"
              label="置顶"
              valuePropName="checked"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>

            <Form.Item
              name="status"
              label="发布状态"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio value={TalkStatus.PUBLISHED}>正式发布</Radio>
                <Radio value={TalkStatus.PRIVATE}>私密</Radio>
                <Radio value={TalkStatus.DRAFT}>草稿</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default TalkEdit
