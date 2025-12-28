import { useState, useEffect } from 'react'
import { Card, Button, message, Spin, Input, Breadcrumb, Space } from 'antd'
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { getAbout, updateAbout } from '@/api/about'

const AboutPage: React.FC = () => {
  const navigate = useNavigate()
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
      <div className="page-container fade-in">
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container fade-in">
      <div className="mb-4">
        <Breadcrumb items={[
          { title: <Link to="/">首页</Link> },
          { title: '关于管理' },
        ]} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
          >
            返回首页
          </Button>
          <h2 className="text-2xl font-bold m-0">关于页面设置</h2>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          size="large"
        >
          保存设置
        </Button>
      </div>

      <Card className="shadow-sm" bordered={false}>
        <div className="mb-6">
          <label className="block text-base font-medium text-gray-700 mb-2">
            页面标题
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入页面标题"
            size="large"
            className="rounded-md"
          />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            页面内容
          </label>
          <div data-color-mode="light" className="border rounded-md overflow-hidden">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              height={600}
              preview="live"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AboutPage

