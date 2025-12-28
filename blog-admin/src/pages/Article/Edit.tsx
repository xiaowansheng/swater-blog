import { useState, useEffect } from 'react'
import { Form, Input, Button, Select, message, Switch, Card, Row, Col, Space, Breadcrumb } from 'antd'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeftOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons'
import { getArticleById, createArticle, updateArticle } from '@/api/article'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'
import { Article, Category, Tag } from '@/types'
import MarkdownEditor from './components/MarkdownEditor'

const ArticleEdit: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const cover = Form.useWatch('cover', form)

  useEffect(() => {
    loadCategories()
    loadTags()
    if (id) {
      loadArticle()
    }
  }, [id])

  const loadCategories = async () => {
    try {
      const data = await getCategoryList()
      setCategories(data)
    } catch (error) {
      console.error('加载分类失败', error)
    }
  }

  const loadTags = async () => {
    try {
      const data = await getTagList()
      setTags(data)
    } catch (error) {
      console.error('加载标签失败', error)
    }
  }

  const loadArticle = async () => {
    try {
      const article = await getArticleById(Number(id))
      form.setFieldsValue({
        ...article,
        tagIds: article.tags.map((t) => t.id),
      })
    } catch (error) {
      console.error('加载文章失败', error)
    }
  }

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      if (id) {
        await updateArticle(Number(id), values)
        message.success('更新成功')
      } else {
        await createArticle(values)
        message.success('创建成功')
      }
      navigate('/article')
    } catch (error) {
      message.error(id ? '更新失败' : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container fade-in">
      <div className="mb-4">
        <Breadcrumb items={[
          { title: <Link to="/">首页</Link> },
          { title: <Link to="/article">文章管理</Link> },
          { title: id ? '编辑文章' : '新建文章' },
        ]} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/article')}
            className="flex items-center"
          >
            返回列表
          </Button>
          <h2 className="text-2xl font-bold m-0">{id ? '编辑文章' : '新建文章'}</h2>
        </div>
        <Space>
          <Button 
            onClick={() => navigate('/article')}
            disabled={loading}
          >
            取消
          </Button>
          <Button 
            type="primary" 
            icon={id ? <SaveOutlined /> : <SendOutlined />}
            loading={loading}
            onClick={() => form.submit()}
          >
            {id ? '保存修改' : '发布文章'}
          </Button>
        </Space>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        initialValues={{ isTop: 0 }}
      >
        <Row gutter={24}>
          <Col xs={24} lg={17}>
            <Card className="shadow-sm mb-6" bordered={false}>
              <Form.Item 
                name="title" 
                label={<span className="font-medium text-gray-700">文章标题</span>} 
                rules={[{ required: true, message: '请输入文章标题' }]}
              >
                <Input placeholder="请输入文章标题" size="large" className="rounded-md" />
              </Form.Item>
              
              <Form.Item 
                name="content" 
                label={<span className="font-medium text-gray-700">文章正文</span>} 
                rules={[{ required: true, message: '请输入文章内容' }]}
              >
                <MarkdownEditor />
              </Form.Item>
            </Card>

            <Card className="shadow-sm" bordered={false} title={<span className="font-medium">文章摘要</span>}>
              <Form.Item name="summary" noStyle>
                <Input.TextArea 
                  rows={4} 
                  placeholder="如果不填写，将自动截取正文前 100 个字符" 
                  className="rounded-md"
                  showCount
                  maxLength={200}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={7}>
            <Card className="shadow-sm mb-6" bordered={false} title={<span className="font-medium">基本设置</span>}>
              <Form.Item 
                name="categoryId" 
                label="文章分类" 
                rules={[{ required: true, message: '请选择文章分类' }]}
              >
                <Select placeholder="请选择分类" className="w-full">
                  {categories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="tagIds" label="文章标签">
                <Select 
                  mode="multiple" 
                  placeholder="请选择标签" 
                  className="w-full"
                  allowClear
                >
                  {tags.map((tag) => (
                    <Select.Option key={tag.id} value={tag.id}>
                      {tag.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="isTop" label="是否置顶" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card className="shadow-sm" bordered={false} title={<span className="font-medium">文章封面</span>}>
              <Form.Item name="cover" noStyle>
                <Input placeholder="输入封面图片 URL" className="mb-4" />
              </Form.Item>
              {cover && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-100">
                  <img 
                    src={cover} 
                    alt="封面预览" 
                    className="w-full h-auto object-cover max-h-48"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL'
                    }}
                  />
                </div>
              )}
              <div className="text-xs text-gray-400 mt-2">
                建议尺寸: 800x450 (16:9)
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default ArticleEdit


