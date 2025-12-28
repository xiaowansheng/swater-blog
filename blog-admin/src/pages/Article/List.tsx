import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Input, Select, Tag, Avatar, Tooltip, Card, Breadcrumb } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import {
  getArticleList,
  deleteArticle,
  deleteBatchArticle,
  publishArticle,
  unpublishArticle,
} from '@/api/article'
import { getCategoryList } from '@/api/category'
import { Article, Category } from '@/types'

const ArticleList: React.FC = () => {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState<{
    keyword: string
    status: number | undefined
    categoryId: number | undefined
  }>({ keyword: '', status: undefined, categoryId: undefined })

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

  const columns = [
    {
      title: '文章信息',
      key: 'info',
      width: 400,
      render: (_: any, record: Article) => (
        <div className="flex items-center gap-3">
          {record.cover ? (
            <img
              src={record.cover}
              alt={record.title}
              className="w-20 h-14 object-cover rounded"
            />
          ) : (
            <div className="w-20 h-14 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              无封面
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {record.isTop === 1 && (
                <Tag color="red" className="flex items-center gap-1">
                  <VerticalAlignTopOutlined />
                  置顶
                </Tag>
              )}
              <span className="font-medium text-gray-800 truncate">{record.title}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
              <span>{record.categoryName}</span>
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
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => {
        const typeMap: Record<string, { color: string; label: string }> = {
          '1': { color: 'blue', label: '原创' },
          '2': { color: 'orange', label: '转载' },
          '3': { color: 'purple', label: '翻译' },
          '4': { color: 'cyan', label: '引用' },
        }
        const t = typeMap[type] || typeMap['1']
        return <Tag color={t.color}>{t.label}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => {
        const statusMap: Record<number, { color: string; label: string }> = {
          0: { color: 'default', label: '草稿' },
          1: { color: 'success', label: '已发布' },
          2: { color: 'warning', label: '私密' },
        }
        const s = statusMap[status] || statusMap[0]
        return <Tag color={s.color}>{s.label}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Article) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/article/edit/${record.id}`)}
            />
          </Tooltip>
          {record.status === 1 ? (
            <Tooltip title="下架">
              <Button
                type="text"
                onClick={() => handleUnpublish(record.id)}
              >
                下架
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="发布">
              <Button
                type="text"
                className="text-green-500"
                onClick={() => handlePublish(record.id)}
              >
                发布
              </Button>
            </Tooltip>
          )}
          <Popconfirm title="确定删除这篇文章吗？" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-container fade-in">
      <div className="mb-4">
        <Breadcrumb items={[
          { title: <Link to="/">首页</Link> },
          { title: '文章管理' },
        ]} />
      </div>
      {/* 搜索栏 */}
      <div className="search-bar">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="搜索文章标题"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={{ width: 240 }}
            onPressEnter={handleSearch}
            allowClear
          />
          <Select
            placeholder="文章状态"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 140 }}
            allowClear
          >
            <Select.Option value={1}>已发布</Select.Option>
            <Select.Option value={0}>草稿</Select.Option>
            <Select.Option value={2}>私密</Select.Option>
          </Select>
          <Select
            placeholder="选择分类"
            value={filters.categoryId}
            onChange={(value) => setFilters({ ...filters, categoryId: value })}
            style={{ width: 160 }}
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
          <div className="flex-1" />
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`确定删除选中的 ${selectedRowKeys.length} 篇文章吗？`}
              onConfirm={handleBatchDelete}
            >
              <Button danger>批量删除 ({selectedRowKeys.length})</Button>
            </Popconfirm>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/article/create')}
          >
            新建文章
          </Button>
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
    </div>
  )
}

export default ArticleList
