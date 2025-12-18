import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Input, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getArticleList, deleteArticle, deleteBatchArticle, publishArticle, unpublishArticle } from '@/api/article'
import { getCategoryList } from '@/api/category'
import { Article, Category } from '@/types'
import { formatDate } from '@/utils/format'

const ArticleList: React.FC = () => {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState({ keyword: '', status: undefined, categoryId: undefined })

  useEffect(() => {
    loadCategories()
    loadArticles()
  }, [])

  useEffect(() => {
    loadArticles()
  }, [pagination.current, pagination.pageSize, filters])

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
      setPagination({ ...pagination, total: result.total })
    } catch (error) {
      console.error('加载文章失败', error)
    } finally {
      setLoading(false)
    }
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
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '分类', dataIndex: 'categoryName', key: 'categoryName' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (status === 1 ? '已发布' : '草稿'),
    },
    { title: '浏览量', dataIndex: 'viewCount', key: 'viewCount' },
    { title: '评论数', dataIndex: 'commentCount', key: 'commentCount' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', render: formatDate },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Article) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/article/edit/${record.id}`)}>
            编辑
          </Button>
          {record.status === 1 ? (
            <Button type="link" onClick={() => handleUnpublish(record.id)}>
              下架
            </Button>
          ) : (
            <Button type="link" onClick={() => handlePublish(record.id)}>
              发布
            </Button>
          )}
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <Space>
          <Input
            placeholder="搜索标题"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={{ width: 200 }}
            onPressEnter={loadArticles}
          />
          <Select
            placeholder="状态"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={1}>已发布</Select.Option>
            <Select.Option value={0}>草稿</Select.Option>
          </Select>
          <Select
            placeholder="分类"
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
          <Button onClick={loadArticles}>搜索</Button>
        </Space>
        <Space>
          {selectedRowKeys.length > 0 && (
            <Popconfirm title="确定批量删除吗？" onConfirm={handleBatchDelete}>
              <Button danger>批量删除</Button>
            </Popconfirm>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/article/create')}>
            新建文章
          </Button>
        </Space>
      </div>
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
          onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
        }}
      />
    </div>
  )
}

export default ArticleList

