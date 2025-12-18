import { useState, useEffect } from 'react'
import { Form, Input, Button, Select, message, Switch } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
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
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="categoryId" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
        <Select>
          {categories.map((cat) => (
            <Select.Option key={cat.id} value={cat.id}>
              {cat.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="tagIds" label="标签">
        <Select mode="multiple">
          {tags.map((tag) => (
            <Select.Option key={tag.id} value={tag.id}>
              {tag.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="summary" label="摘要">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="cover" label="封面">
        <Input />
      </Form.Item>
      <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
        <MarkdownEditor />
      </Form.Item>
      <Form.Item name="isTop" label="置顶" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {id ? '更新' : '创建'}
        </Button>
        <Button className="ml-2" onClick={() => navigate('/article')}>
          取消
        </Button>
      </Form.Item>
    </Form>
  )
}

export default ArticleEdit

