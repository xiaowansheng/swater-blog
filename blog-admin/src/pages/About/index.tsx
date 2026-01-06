import { useState, useEffect } from 'react'
import { Card, Button, message, Spin, Input, Breadcrumb, Space } from 'antd'
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { getAbout, updateAbout } from '@/api/about'
import MarkdownEditor from '@/components/common/MarkdownEditor'

const AboutPage: React.FC = () => {
  const navigate = useNavigate()
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
      setContent(data.content || '')
    } catch (error) {
      console.error('加载关于页面失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) {
      message.warning('请输入内容')
      return
    }

    setSaving(true)
    try {
      await updateAbout({ content })
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

      <Card className="shadow-sm" variant="borderless">
        <div className="mb-6">
          <label className="block text-base font-medium text-gray-700 mb-2">
            页面内容
          </label>
          <MarkdownEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            height={500}
          />
        </div>
      </Card>
    </div>
  )
}

export default AboutPage

