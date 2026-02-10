import { useState, useEffect } from 'react'
import {
  Table, Button, Space, Popconfirm, message, Input, Select, Tag,
  Dropdown, Modal, Tooltip,
} from 'antd'
import type { MenuProps } from 'antd'
import Image from '@/components/common/ImageWithPreview'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  VerticalAlignTopOutlined,
  EyeFilled,
  ImportOutlined,
  ExportOutlined,
  DownOutlined,
  FormOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  getArticleList,
  deleteArticle,
  deleteBatchArticle,
  publishArticle,
  unpublishArticle,
} from '@/api/article'
import { getCategoryList } from '@/api/category'
import ArticleEditModal from './components/ArticleEditModal'
import { Article, Category, ArticleStatus, ArticleType, ARTICLE_STATUS_MAP, ARTICLE_TYPE_MAP } from '@/types'

const ArticleList: React.FC = () => {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState<{
    keyword: string
    id: string
    articleKey: string
    status: number | undefined
    categoryId: number | undefined
    type: string | undefined
    isTop: number | undefined
  }>({ keyword: '', id: '', articleKey: '', status: undefined, categoryId: undefined, type: undefined, isTop: undefined })

  // 修改弹窗相关状态
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadArticles()
  }, [pagination.current, pagination.pageSize])

  const loadCategories = async () => {
    try {
      const data = await getCategoryList()
      setCategories(data)
    } catch (error) {
      console.error('加载分类失败', error)
    }
  }

  const loadArticles = async () => {
    setLoading(true)
    try {
      const result = await getArticleList({
        page: pagination.current,
        size: pagination.pageSize,
        ...filters,
      })
      setArticles(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('加载文章失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    loadArticles()
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteArticle(id)
      message.success('删除成功')
      loadArticles()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleBatchDelete = async () => {
    try {
      await deleteBatchArticle(selectedRowKeys as number[])
      message.success('批量删除成功')
      setSelectedRowKeys([])
      loadArticles()
    } catch (error) {
      message.error('批量删除失败')
    }
  }

  const handlePublish = async (id: number) => {
    try {
      await publishArticle(id)
      message.success('发布成功')
      loadArticles()
    } catch (error) {
      message.error('发布失败')
    }
  }

  const handleUnpublish = async (id: number) => {
    try {
      await unpublishArticle(id)
      message.success('下架成功')
      loadArticles()
    } catch (error) {
      message.error('下架失败')
    }
  }

  const handlePreview = (id: number) => {
    navigate(`/article/preview/${id}`)
  }

  // 打开修改弹窗
  const handleOpenEditModal = (record: Article) => {
    setEditingArticle(record)
    setEditModalOpen(true)
  }

  // 构建操作下拉菜单
  const getDropdownItems = (record: Article): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'preview',
        icon: <EyeFilled />,
        label: '预览',
        onClick: () => handlePreview(record.id),
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑内容',
        onClick: () => navigate(`/article/edit/${record.id}`),
      },
      {
        key: 'modify',
        icon: <FormOutlined />,
        label: '修改属性',
        onClick: () => handleOpenEditModal(record),
      },
      { type: 'divider' },
    ]

    if (record.status === ArticleStatus.PUBLISHED) {
      items.push({
        key: 'unpublish',
        icon: <StopOutlined />,
        label: '下架',
        onClick: () => handleUnpublish(record.id),
      })
    } else {
      items.push({
        key: 'publish',
        icon: <CheckCircleOutlined />,
        label: '发布',
        onClick: () => handlePublish(record.id),
      })
    }

    items.push(
      { type: 'divider' },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: '确认删除',
            content: `确定删除文章「${record.title}」吗？此操作不可恢复。`,
            okText: '确定删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => handleDelete(record.id),
          })
        },
      },
    )

    return items
  }

  const columns = [
    {
      title: '文章信息',
      key: 'info',
      width: 500,
      render: (_: any, record: Article) => (
        <div className="flex items-center gap-3">
          {record.cover ? (
            <Image
              src={record.cover}
              alt={record.title}
              width={80}
              height={56}
              className="object-cover rounded"
            />
          ) : (
            <div className="w-20 h-14 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              无封面
            </div>
          )}
          <div className="flex-1 min-w-0">
            {/* ID和Key作为小字在标题上方 */}
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
              <span className="text-gray-500">ID: {record.id}</span>
              {record.articleKey && (
                <span className="text-gray-500">Key: {record.articleKey}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {record.isTop === 1 && (
                <Tag color="red" className="flex items-center gap-1">
                  <VerticalAlignTopOutlined />
                  置顶
                </Tag>
              )}
              {/* 文章类型 */}
              {(() => {
                const t = ARTICLE_TYPE_MAP[record.type as keyof typeof ARTICLE_TYPE_MAP] || ARTICLE_TYPE_MAP[ArticleType.ORIGINAL]
                return <Tag color={t.color} className="mr-0">{t.label}</Tag>
              })()}
              <Tooltip title={record.title}>
                <span className="font-medium text-gray-800 block truncate" style={{ maxWidth: 280 }}>{record.title}</span>
              </Tooltip>
            </div>
            <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
              <Tag color="cyan" className="text-xs">{record.categoryName}</Tag>

              <span className="flex items-center gap-1" title="创建时间">
                <ClockCircleOutlined /> {record.createTime}
              </span>

              <span className="flex items-center gap-1">
                <EyeOutlined /> {record.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <LikeOutlined /> {record.likeCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <CommentOutlined /> {record.commentCount}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: Article['tags']) => (
        <div className="flex flex-wrap gap-1">
          {tags?.slice(0, 3).map((tag) => (
            <Tag key={tag.id} color={tag.color || 'blue'}>
              {tag.name}
            </Tag>
          ))}
          {tags && tags.length > 3 && (
            <Tag>+{tags.length - 3}</Tag>
          )}
        </div>
      ),
    },

    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => {
        const s = ARTICLE_STATUS_MAP[status as keyof typeof ARTICLE_STATUS_MAP] || ARTICLE_STATUS_MAP[ArticleStatus.DRAFT]
        return <Tag color={s.color}>{s.label}</Tag>
      },
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Article) => {
        return (
          <Dropdown
            menu={{ items: getDropdownItems(record) }}
            trigger={['click']}
          >
            <Button type="primary" ghost size="small">
              操作 <DownOutlined />
            </Button>
          </Dropdown>
        )
      },
    },
  ]

  return (
    <div className="fade-in">
      {/* 搜索栏 */}
      <div className="search-bar">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="搜索文章标题"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={{ width: 200 }}
            onPressEnter={handleSearch}
            allowClear
          />
          <Input
            placeholder="文章ID"
            value={filters.id}
            onChange={(e) => setFilters({ ...filters, id: e.target.value })}
            style={{ width: 120 }}
            onPressEnter={handleSearch}
            allowClear
          />
          <Input
            placeholder="文章Key"
            value={filters.articleKey}
            onChange={(e) => setFilters({ ...filters, articleKey: e.target.value })}
            style={{ width: 150 }}
            onPressEnter={handleSearch}
            allowClear
          />
          <Select
            placeholder="文章状态"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={ArticleStatus.PUBLISHED}>已发布</Select.Option>
            <Select.Option value={ArticleStatus.DRAFT}>草稿</Select.Option>
            <Select.Option value={ArticleStatus.PRIVATE}>私密</Select.Option>
          </Select>
          <Select
            placeholder="文章类型"
            value={filters.type}
            onChange={(value) => setFilters({ ...filters, type: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={ArticleType.ORIGINAL}>原创</Select.Option>
            <Select.Option value={ArticleType.REPOST}>转载</Select.Option>
            <Select.Option value={ArticleType.TRANSLATION}>翻译</Select.Option>
            <Select.Option value={ArticleType.QUOTE}>引用</Select.Option>
          </Select>
          <Select
            placeholder="是否置顶"
            value={filters.isTop}
            onChange={(value) => setFilters({ ...filters, isTop: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={1}>置顶</Select.Option>
            <Select.Option value={0}>普通</Select.Option>
          </Select>
          <Select
            placeholder="选择分类"
            value={filters.categoryId}
            onChange={(value) => setFilters({ ...filters, categoryId: value })}
            style={{ width: 150 }}
            allowClear
          >
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="action-bar mb-4">
        <div className="flex items-center justify-between">
          <div>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确定删除选中的 ${selectedRowKeys.length} 篇文章吗？`}
                onConfirm={handleBatchDelete}
              >
                <Button danger>批量删除 ({selectedRowKeys.length})</Button>
              </Popconfirm>
            )}
          </div>
          <Space>
            <Button
              icon={<ImportOutlined />}
              onClick={() => navigate('/article/import')}
            >
              导入 MD 文档
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={() => navigate('/article/export')}
            >
              导出 MD 文档
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/article/create')}
            >
              新建文章
            </Button>
          </Space>
        </div>
      </div>

      {/* 表格 */}
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 篇文章`,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
        />
      </div>

      {/* 修改属性弹窗 */}
      <ArticleEditModal
        open={editModalOpen}
        article={editingArticle}
        onClose={() => {
          setEditModalOpen(false)
          setEditingArticle(null)
        }}
        onSuccess={() => {
          setEditModalOpen(false)
          setEditingArticle(null)
          loadArticles()
        }}
      />
    </div>
  )
}

export default ArticleList
