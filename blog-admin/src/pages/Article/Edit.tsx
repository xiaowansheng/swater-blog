import { useState, useEffect } from 'react'
import { Form, Input, Button, Select, message, Switch, Card, Row, Col, Space, Breadcrumb } from 'antd'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeftOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons'
import { getArticleById, createArticle, updateArticle } from '@/api/article'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'
import { Article, Category, Tag } from '@/types'
import MarkdownEditor from './components/MarkdownEditor'
import CategorySelector from './components/CategorySelector'
import TagSelector from './components/TagSelector'

const ArticleEdit: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [articleStatus, setArticleStatus] = useState<number>(0)
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
      setArticleStatus(article.status)
      form.setFieldsValue({
        ...article,
        categoryId: article.categoryId,
        tagIds: article.tags.map((t) => t.id),
      })
    } catch (error) {
      console.error('加载文章失败', error)
    }
  }

  const onFinish = async (values: any, status: number = 1) => {
    setLoading(true)
    try {
      // 分离已有的 ID 和新输入的名称
      const tagIds: number[] = []
      const tagNames: string[] = []
      
      if (values.tagIds) {
        values.tagIds.forEach((item: any) => {
          if (typeof item === 'number') {
            tagIds.push(item)
          } else {
            tagNames.push(item)
          }
        })
      }

      let categoryId = undefined
      let categoryName = undefined
      const categoryValue = values.categoryId
      if (typeof categoryValue === 'number') {
        categoryId = categoryValue
      } else if (categoryValue) {
        categoryName = categoryValue
      }

      const payload = {
        ...values,
        status,
        tagIds,
        tagNames,
        categoryId,
        categoryName,
        isTop: values.isTop ? 1 : 0
      }

      if (id) {
        await updateArticle(Number(id), payload)
        message.success(status === 0 ? '草稿保存成功' : '更新成功')
      } else {
        await createArticle(payload)
        message.success(status === 0 ? '草稿保存成功' : '发布成功')
      }
      setArticleStatus(status)
      navigate('/article')
    } catch (error) {
      message.error(id ? '更新失败' : '发布失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = () => {
    if (!id) return null
    return (
      <span className={`px-2 py-1 rounded text-xs ${articleStatus === 1 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
        {articleStatus === 1 ? '已发布' : '草稿'}
      </span>
    )
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
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold m-0">{id ? '编辑文章' : '新建文章'}</h2>
            {getStatusTag()}
          </div>
        </div>
        <Space>
          <Button 
            onClick={() => navigate('/article')}
            disabled={loading}
          >
            取消
          </Button>
          <Button 
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => {
              form.validateFields().then(values => onFinish(values, 0))
            }}
          >
            保存草稿
          </Button>
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            loading={loading}
            onClick={() => {
              form.validateFields().then(values => onFinish(values, 1))
            }}
          >
            {id ? '保存修改' : '发布文章'}
          </Button>
        </Space>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
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
                  <Input placeholder="请输入文章标题" size="large" className="rounded-md font-bold text-lg" />
                </Form.Item>

                <Form.Item 
                  name="slug" 
                  label={<span className="font-medium text-gray-700">访问路径 (Slug)</span>}
                  extra="如果不填写，将根据标题自动生成。仅支持字母、数字和连字符。"
                >
                  <Input placeholder="example-article-slug" className="rounded-md" />
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
                rules={[{ required: true, message: '请选择或输入文章分类' }]}
              >
                <CategorySelector categories={categories} />
              </Form.Item>

              <Form.Item name="tagIds" label="文章标签">
                <TagSelector tags={tags} />
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


