import { useState, useEffect, useCallback, useRef } from 'react'
import { Form, Input, Button, message, Switch, Card, Row, Col, Space, Breadcrumb, Modal, Radio } from 'antd'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeftOutlined, SaveOutlined, SendOutlined, CloudSyncOutlined } from '@ant-design/icons'
import { getArticleById, ArticleSaveDTO } from '@/api/article'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'
import { Category, Tag, ArticleStatus, ArticleType } from '@/types'
import MarkdownEditor from '@/components/common/MarkdownEditor'
import CategorySelector from './components/CategorySelector'
import TagSelector from './components/TagSelector'
import ImageUpload from '@/components/common/ImageUpload'
import SaveStatusIndicator from '@/components/article/SaveStatusIndicator'
import ConflictResolutionModal from '@/components/article/ConflictResolutionModal'
import useArticleAutoSave from '@/hooks/useArticleAutoSave'

const ArticleEdit: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [articleStatus, setArticleStatus] = useState<number>(ArticleStatus.DRAFT)
  const [showConflictModal, setShowConflictModal] = useState(false)
  const type = Form.useWatch('type', form)
  
  // 用于跟踪内容变化
  const contentRef = useRef<string>('')

  // 自动保存Hook
  const {
    saveState,
    save,
    debouncedAutoSave,
    startAutoSaveTimer,
    stopAutoSaveTimer,
    retry,
    resolveConflictWithServer,
    resolveConflictWithLocal,
    initArticle,
    getStatusText,
    isSaving,
  } = useArticleAutoSave({
    autoSaveInterval: 5 * 60 * 1000, // 5分钟
    debounceDelay: 500,
    enableAutoSave: true,
    enableContentChangeAutoSave: true,
    onSaveSuccess: (result) => {
      if (result.isNew && !id) {
        // 新建文章成功后，更新URL但不跳转
        window.history.replaceState(null, '', `/article/edit/${result.id}`)
      }
      setArticleStatus(result.status)
    },
    onConflict: () => {
      setShowConflictModal(true)
    },
  })

  // 文章类型选项
  const articleTypeOptions = [
    { value: ArticleType.ORIGINAL, label: '原创' },
    { value: ArticleType.REPOST, label: '转载' },
    { value: ArticleType.TRANSLATION, label: '翻译' },
    { value: ArticleType.QUOTE, label: '引用' },
  ]

  // 文章状态选项
  const articleStatusOptions = [
    { value: ArticleStatus.PUBLISHED, label: '公开发布' },
    { value: ArticleStatus.PRIVATE, label: '私密' },
  ]

  // 获取当前表单数据
  const getFormData = useCallback((): Omit<ArticleSaveDTO, 'autoSave' | 'clientVersion'> => {
    const values = form.getFieldsValue()
    
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

    return {
      id: saveState.articleId || (id ? Number(id) : undefined),
      title: values.title || '',
      slug: values.slug,
      content: values.content || '',
      excerpt: values.summary,
      cover: values.cover,
      categoryId,
      categoryName,
      type: values.type,
      originalAuthor: values.originalAuthor,
      originalTitle: values.originalTitle,
      originalUrl: values.originalUrl,
      status: values.publishStatus || ArticleStatus.DRAFT,
      isTop: values.isTop ? 1 : 0,
      tagIds,
      tagNames,
    }
  }, [form, id, saveState.articleId])

  useEffect(() => {
    loadCategories()
    loadTags()
    if (id) {
      loadArticle()
    } else {
      // 新建文章时启动自动保存定时器
      startAutoSaveTimer(getFormData)
    }

    return () => {
      stopAutoSaveTimer()
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
      
      // 初始化自动保存的文章ID和版本号
      initArticle(article.id, (article as any).version || 1)
      
      form.setFieldsValue({
        ...article,
        type: article.type || ArticleType.ORIGINAL,
        publishStatus: article.status === ArticleStatus.DRAFT ? ArticleStatus.PUBLISHED : article.status,
        categoryId: article.categoryId,
        tagIds: article.tags.map((t) => t.id),
        summary: article.excerpt,
      })
      
      contentRef.current = article.content
      
      // 加载完成后启动自动保存定时器
      startAutoSaveTimer(getFormData)
    } catch (error) {
      console.error('加载文章失败', error)
    }
  }

  // 处理内容变化，触发防抖自动保存
  const handleContentChange = useCallback((content: string) => {
    form.setFieldValue('content', content)
    
    // 只有内容真正变化时才触发自动保存
    if (content !== contentRef.current) {
      contentRef.current = content
      const formData = getFormData()
      if (formData.title) {
        debouncedAutoSave(formData)
      }
    }
  }, [form, getFormData, debouncedAutoSave])

  // 处理标题变化
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    form.setFieldValue('title', title)
    
    const formData = getFormData()
    if (formData.content) {
      debouncedAutoSave(formData)
    }
  }, [form, getFormData, debouncedAutoSave])

  // 手动保存草稿
  const handleSaveDraft = async () => {
    try {
      await form.validateFields(['title', 'content'])
      const formData = getFormData()
      save({ ...formData, status: ArticleStatus.DRAFT })
    } catch (error) {
      // 验证失败
    }
  }

  // 手动保存到服务器
  const handleSaveToServer = async () => {
    try {
      await form.validateFields(['title', 'content'])
      const formData = getFormData()
      save(formData)
    } catch (error) {
      // 验证失败
    }
  }

  // 发布文章
  const onFinish = async (values: any, status: number = 1) => {
    setLoading(true)
    try {
      const formData = getFormData()
      // 如果当前是草稿，点击发布时应该根据表单选择的状态（公开/私密）来发布
      // 如果当前已经是发布或私密状态，点击发布时则更新其状态
      const finalStatus = articleStatus === ArticleStatus.DRAFT ? ArticleStatus.DRAFT : (values.publishStatus || ArticleStatus.PUBLISHED)
      
      save({ ...formData, status: finalStatus })
      setIsModalOpen(false)
    } catch (error) {
      message.error('发布失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理冲突 - 使用服务器版本
  const handleUseServerVersion = () => {
    if (saveState.conflictData) {
      form.setFieldValue('content', saveState.conflictData.serverContent)
      contentRef.current = saveState.conflictData.serverContent
    }
    resolveConflictWithServer()
    setShowConflictModal(false)
    // 重新加载文章获取最新版本号
    if (id) {
      loadArticle()
    }
  }

  // 处理冲突 - 使用本地版本覆盖
  const handleUseLocalVersion = () => {
    const formData = getFormData()
    resolveConflictWithLocal(formData)
    setShowConflictModal(false)
  }

  // 重试保存
  const handleRetry = () => {
    const formData = getFormData()
    retry(formData)
  }

  const getStatusTag = () => {
    if (!id && !saveState.articleId) return null
    const statusMap: Record<number, { bg: string; text: string; label: string }> = {
      [ArticleStatus.DRAFT]: { bg: 'bg-orange-100', text: 'text-orange-600', label: '草稿' },
      [ArticleStatus.PUBLISHED]: { bg: 'bg-green-100', text: 'text-green-600', label: '已发布' },
      [ArticleStatus.PRIVATE]: { bg: 'bg-gray-100', text: 'text-gray-600', label: '私密' },
    }
    const status = statusMap[articleStatus as keyof typeof statusMap] || statusMap[ArticleStatus.DRAFT]
    return (
      <span className={`px-2 py-1 rounded text-xs ${status.bg} ${status.text}`}>
        {status.label}
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
          {/* 保存状态指示器 */}
          <SaveStatusIndicator 
            saveState={saveState}
            statusText={getStatusText()}
            onRetry={handleRetry}
          />
          
          <Button 
            icon={<CloudSyncOutlined />}
            loading={isSaving}
            onClick={handleSaveToServer}
          >
            保存到服务器
          </Button>
          <Button 
            icon={<SaveOutlined />}
            loading={isSaving}
            onClick={handleSaveDraft}
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
          <Card className="shadow-sm mb-6" variant="borderless">
            <Form.Item 
                name="title" 
                rules={[{ required: true, message: '请输入文章标题' }]}
              >
                <Input 
                  placeholder="文章标题" 
                  size="large" 
                  variant="borderless"
                  className="text-3xl font-bold border-none px-0 focus:shadow-none hover:bg-transparent" 
                  onChange={handleTitleChange}
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
                    variant="borderless"
                    className="p-0 text-sm w-fit focus:shadow-none" 
                  />
                </div>
              </Form.Item>
              
              <Form.Item 
                name="content" 
                rules={[{ required: true, message: '请输入文章内容' }]}
              >
                <MarkdownEditor onChange={handleContentChange} />
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
              loading={loading || isSaving}
              onClick={() => {
                form.validateFields().then(values => {
                  onFinish(values, 1);
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

                <Form.Item name="type" label="文章类型" initialValue="1">
                  <Radio.Group options={articleTypeOptions} optionType="button" buttonStyle="solid" />
                </Form.Item>

                <Form.Item name="publishStatus" label="发布状态" initialValue={1}>
                  <Radio.Group options={articleStatusOptions} optionType="button" buttonStyle="solid" />
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

                {(type === ArticleType.REPOST || type === ArticleType.TRANSLATION || type === ArticleType.QUOTE) && (
                  <>
                    <Form.Item name="originalAuthor" label="原文作者">
                      <Input placeholder="请输入原文作者" />
                    </Form.Item>
                    <Form.Item name="originalTitle" label="原文标题">
                      <Input placeholder="请输入原文标题" />
                    </Form.Item>
                    <Form.Item name="originalUrl" label="原文链接">
                      <Input placeholder="请输入原文链接" />
                    </Form.Item>
                  </>
                )}
              </Col>
              <Col span={12}>
                <Form.Item name="cover" label="文章封面">
                  <ImageUpload 
                    placeholder="点击或拖拽上传文章封面" 
                    category="article_cover"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Modal>
      </Form>

      {/* 冲突解决对话框 */}
      <ConflictResolutionModal
        visible={showConflictModal}
        localContent={form.getFieldValue('content') || ''}
        serverContent={saveState.conflictData?.serverContent || ''}
        serverUpdateTime={saveState.conflictData?.serverUpdateTime || ''}
        onUseServer={handleUseServerVersion}
        onUseLocal={handleUseLocalVersion}
        onCancel={() => setShowConflictModal(false)}
      />
    </div>
  )
}

export default ArticleEdit
