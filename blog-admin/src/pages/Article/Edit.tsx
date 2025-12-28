import { useState, useEffect } from 'react'
import { Form, Input, Button, Select, message, Switch, Card, Row, Col, Space, Breadcrumb, Modal } from 'antd'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeftOutlined, SaveOutlined, SendOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons'
import { getArticleById, createArticle, updateArticle } from '@/api/article'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'
import { Article, Category, Tag } from '@/types'
import MarkdownEditor from './components/MarkdownEditor'
import CategorySelector from './components/CategorySelector'
import TagSelector from './components/TagSelector'
import ImageUpload from './components/ImageUpload'

const ArticleEdit: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
    <div className="page-container fade-in px-4">
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
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => {
              form.validateFields(['title', 'content']).then(values => onFinish({ ...form.getFieldsValue(), ...values }, 0))
            }}
          >
            保存草稿
          </Button>
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            loading={loading}
            onClick={() => {
              form.validateFields(['title', 'content']).then(() => setIsModalOpen(true))
            }}
          >
            发布配置
          </Button>
        </Space>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{ isTop: 0 }}
      >
        <div className="w-full">
          <Card className="shadow-sm mb-6" bordered={false}>
            <Form.Item 
                name="title" 
                rules={[{ required: true, message: '请输入文章标题' }]}
              >
                <Input 
                  placeholder="文章标题" 
                  size="large" 
                  bordered={false}
                  className="text-3xl font-bold border-none px-0 focus:shadow-none hover:bg-transparent" 
                />
              </Form.Item>

              <Form.Item 
                name="slug" 
                className="mb-4"
              >
                <div className="flex items-center text-gray-400 text-sm">
                  <span className="mr-2">访问路径:</span>
                  <Input 
                    placeholder="example-article-slug" 
                    bordered={false}
                    className="p-0 text-sm w-fit focus:shadow-none" 
                  />
                </div>
              </Form.Item>
              
              <Form.Item 
                name="content" 
                rules={[{ required: true, message: '请输入文章内容' }]}
              >
                <MarkdownEditor />
              </Form.Item>
          </Card>
        </div>

        <Modal
          title="发布文章配置"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          width={700}
          footer={[
            <Button key="back" onClick={() => setIsModalOpen(false)}>
              返回编辑
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              icon={<SendOutlined />}
              loading={loading}
              onClick={() => {
                form.validateFields().then(values => {
                  onFinish(values, 1);
                  setIsModalOpen(false);
                })
              }}
            >
              确认发布
            </Button>,
          ]}
        >
          <div className="py-4">
            <Row gutter={24}>
              <Col span={12}>
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

                <Form.Item name="summary" label="文章摘要">
                  <Input.TextArea 
                    rows={4} 
                    placeholder="如果不填写，将自动截取正文前 100 个字符" 
                    className="rounded-md"
                    showCount
                    maxLength={200}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="cover" label="文章封面">
                  <ImageUpload placeholder="点击或拖拽上传文章封面" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Modal>
      </Form>
    </div>
  )
}

export default ArticleEdit


