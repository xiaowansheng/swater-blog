import { useState, useEffect } from 'react'
import { Form, Button, message, Card, Switch, Radio, Space } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined, SendOutlined, SaveOutlined } from '@ant-design/icons'
import { createTalk, updateTalk, getTalkById } from '@/api/talk'
import { TalkStatus } from '@/types'
import RichTextEditor from '@/components/common/RichTextEditor'
import MultiImageUpload from '@/components/common/MultiImageUpload'

const TalkEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const status = Form.useWatch('status', form)

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
    } catch (error) {
      message.error('加载说说失败')
      navigate('/talk')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    setSubmitting(true)
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
      navigate('/talk')
    } catch (error) {
      console.error('提交失败', error)
      message.error('操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-4 mb-4">
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
                <Radio value={TalkStatus.DRAFT}>保存草稿</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          <Form.Item className="mb-0 mt-4">
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={status === TalkStatus.PUBLISHED ? <SendOutlined /> : <SaveOutlined />}
                size="large"
              >
                {isEdit ? '保存修改' : (status === TalkStatus.PUBLISHED ? '立即发布' : '保存草稿')}
              </Button>
              <Button size="large" onClick={() => navigate('/talk')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default TalkEdit
