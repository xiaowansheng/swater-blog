import { useState, useEffect } from 'react'
import { Card, Button, message, Spin, Input } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import MDEditor from '@uiw/react-md-editor'
import { getAbout, updateAbout } from '@/api/about'

const AboutPage: React.FC = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAbout()
  }, [])

  const loadAbout = async () => {
    setLoading(true)
    try {
      const data = await getAbout()
      setTitle(data.title || '')
      setContent(data.content || '')
    } catch (error) {
      console.error('加载关于页面失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      message.warning('请输入标题')
      return
    }
    if (!content.trim()) {
      message.warning('请输入内容')
      return
    }

    setSaving(true)
    try {
      await updateAbout({ title, content })
      message.success('保存成功')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <Card
        title="关于页面"
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            保存
          </Button>
        }
        className="chart-card"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            页面标题
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入页面标题"
            size="large"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            页面内容
          </label>
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              height={500}
              preview="live"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AboutPage
