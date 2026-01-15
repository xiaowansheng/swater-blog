import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Space, message, Spin, Breadcrumb, Tag, Image, Descriptions, Divider } from 'antd'
import { ArrowLeftOutlined, FilePdfOutlined, FileMarkdownOutlined, PrinterOutlined } from '@ant-design/icons'
import { getArticleById } from '@/api/article'
import { Article, ArticleStatus, ArticleType, ARTICLE_STATUS_MAP, ARTICLE_TYPE_MAP } from '@/types'
import { printMarkdownAsPdf } from '@/utils/printMarkdown'
import { getFullUrl } from '@/utils/format'
import MarkdownPreview from '@/components/common/MarkdownPreview'

const ArticlePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const loadedIdRef = useRef<string | null>(null)

  const loadArticle = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getArticleById(Number(id))
      setArticle(data)
      loadedIdRef.current = id
    } catch (error) {
      message.error('加载文章失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    if (loadedIdRef.current === id && article) {
      return
    }
    loadArticle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleExportPdf = async () => {
    if (!article) return
    try {
      await printMarkdownAsPdf(article.title || 'article', article.content || '')
      message.success('正在打印 PDF...')
    } catch (error: any) {
      message.error(error?.message || '打印 PDF 失败')
    }
  }

  const handleExportMarkdown = () => {
    if (!article) return
    try {
      const blob = new Blob([article.content || ''], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${article.title || 'article'}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      message.success('导出 Markdown 成功')
    } catch (error) {
      message.error('导出 Markdown 失败')
    }
  }

  const handlePrint = async () => {
    if (!article) return
    try {
      await printMarkdownAsPdf(article.title || 'article', article.content || '')
    } catch (error: any) {
      message.error(error?.message || '打印失败')
    }
  }

  // 计算状态和类型信息
  const statusInfo = article
    ? (ARTICLE_STATUS_MAP[article.status as keyof typeof ARTICLE_STATUS_MAP] || ARTICLE_STATUS_MAP[ArticleStatus.DRAFT])
    : null
  const typeInfo = article
    ? (ARTICLE_TYPE_MAP[article.type as keyof typeof ARTICLE_TYPE_MAP] || ARTICLE_TYPE_MAP[ArticleType.ORIGINAL])
    : null

  // 单一 return，使用条件渲染
  return (
    <div className="fade-in p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Spin size="large" />
          </div>
        )}

        {/* 错误状态 */}
        {!loading && !article && (
          <div className="p-6">
            <Card>
              <p>文章不存在</p>
              <Button type="primary" onClick={() => navigate(-1)}>
                返回
              </Button>
            </Card>
          </div>
        )}

        {/* 主要内容 */}
        {!loading && article && (
          <>
            <Breadcrumb className="mb-4">
              <Breadcrumb.Item>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate(-1)}
                  className="text-gray-600"
                >
                  返回
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Item>文章管理</Breadcrumb.Item>
              <Breadcrumb.Item>文章预览</Breadcrumb.Item>
            </Breadcrumb>

            <Card className="mb-4">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="文章ID">{article.id}</Descriptions.Item>
                <Descriptions.Item label="文章Key">{article.articleKey || '-'}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={statusInfo?.color}>{statusInfo?.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="类型">
                  <Tag color={typeInfo?.color}>{typeInfo?.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="分类">{article.categoryName || '-'}</Descriptions.Item>
                <Descriptions.Item label="标签">
                  <Space wrap>
                    {article.tags?.map((tag) => (
                      <Tag key={tag.id} color={tag.color || 'blue'}>
                        {tag.name}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="浏览量">{article.viewCount}</Descriptions.Item>
                <Descriptions.Item label="点赞数">{article.likeCount || 0}</Descriptions.Item>
                <Descriptions.Item label="评论数">{article.commentCount}</Descriptions.Item>
                <Descriptions.Item label="创建时间" span={2}>
                  {article.createTime}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Space className="mb-4">
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={handleExportPdf}
                >
                  打印为 PDF
                </Button>
                <Button
                  icon={<FileMarkdownOutlined />}
                  onClick={handleExportMarkdown}
                >
                  导出 Markdown
                </Button>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                >
                  打印
                </Button>
                <Button
                  onClick={() => navigate(`/article/edit/${article.id}`)}
                >
                  编辑文章
                </Button>
              </Space>
            </Card>

            <Card title={article.title} className="mb-4">
          {article.cover && (
            <div className="mb-4">
              <Image src={getFullUrl(article.cover)} alt={article.title} width="100%" className="rounded" />
            </div>
          )}
              {article.excerpt && (
                <div className="mb-4 p-4 bg-gray-100 rounded text-gray-700 italic">
                  {article.excerpt}
                </div>
              )}
            </Card>

            <Card>
              <MarkdownPreview value={article.content || ''} />
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default ArticlePreview
