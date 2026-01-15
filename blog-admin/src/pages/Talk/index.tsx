import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Space, Tag, Row, Col, Input, Select, Empty, Spin, message, Avatar, Tooltip } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  VerticalAlignTopOutlined,
  EnvironmentOutlined,
  MobileOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import { getTalkList, deleteTalk } from '@/api/talk'
import { getAuthorConfig } from '@/api/config'
import { Talk, TalkStatus, TALK_STATUS_MAP } from '@/types'
import { getFullUrl } from '@/utils/format'
import TalkContent from './components/TalkContent'
import TalkImages from './components/TalkImages'
import ActionMenu from './components/ActionMenu'

interface AuthorInfo {
  name: string
  avatar: string
}

const TalkPage: React.FC = () => {
  const navigate = useNavigate()
  const [talks, setTalks] = useState<Talk[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState<{
    keyword?: string
    status?: string
    isTop?: number
  }>({})
  const [authorInfo, setAuthorInfo] = useState<AuthorInfo>({ name: '', avatar: '' })

  useEffect(() => {
    loadTalks()
    loadAuthorConfig()
  }, [pagination.current, pagination.pageSize])

  const loadAuthorConfig = async () => {
    try {
      const authorConfig = await getAuthorConfig()
      setAuthorInfo({
        name: authorConfig.name,
        avatar: authorConfig.avatar,
      })
    } catch (error) {
      console.error('加载作者配置失败', error)
    }
  }

  const loadTalks = async () => {
    setLoading(true)
    try {
      const result = await getTalkList({
        page: pagination.current,
        size: pagination.pageSize,
        ...filters,
      })
      setTalks(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('加载说说失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 })
    loadTalks()
  }

  const handleReset = () => {
    setFilters({})
    setPagination({ ...pagination, current: 1 })
  }

  const handleCreate = () => {
    navigate('/talk/create')
  }

  const handleEdit = (talk: Talk) => {
    navigate(`/talk/edit/${talk.id}`)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTalk(id)
      message.success('删除成功')
      loadTalks()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const getStatusColor = (status: string) => {
    const s = TALK_STATUS_MAP[status as keyof typeof TALK_STATUS_MAP] || TALK_STATUS_MAP[TalkStatus.DRAFT]
    return s.color
  }

  const getStatusLabel = (status: string) => {
    const s = TALK_STATUS_MAP[status as keyof typeof TALK_STATUS_MAP] || TALK_STATUS_MAP[TalkStatus.DRAFT]
    return s.label
  }

  return (
    <div>
      {/* 搜索栏 */}
      <div className="search-bar">
        <div className="flex flex-wrap items-center gap-4">
          <Select
            placeholder="发布状态"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={TalkStatus.PUBLISHED}>已发布</Select.Option>
            <Select.Option value={TalkStatus.PRIVATE}>私密</Select.Option>
            <Select.Option value={TalkStatus.DRAFT}>草稿</Select.Option>
          </Select>
          <Select
            placeholder="置顶状态"
            value={filters.isTop}
            onChange={(value) => setFilters({ ...filters, isTop: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={1}>已置顶</Select.Option>
            <Select.Option value={0}>未置顶</Select.Option>
          </Select>
          <Input
            placeholder="搜索说说内容"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={{ width: 200 }}
            allowClear
            onPressEnter={handleSearch}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="action-bar mb-4">
        <div className="flex items-center justify-between">
          <div>
            {/* 左侧操作区域 - 可扩展其他操作按钮 */}
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            发布说说
          </Button>
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : talks.length === 0 ? (
          <Empty description="暂无说说" className="py-12" />
        ) : (
          <Row gutter={[16, 16]}>
            {talks.map((talk) => (
              <Col xs={24} sm={24} md={24} lg={24} key={talk.id}>
                <Card
                  hoverable
                  className="talk-card shadow-sm"
                  onClick={() => navigate(`/talk/detail/${talk.id}`)}
                >
                  {/* 头部：作者信息 + 标签 + 操作按钮 */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar src={getFullUrl(authorInfo.avatar)} size={40}>
                        {authorInfo.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{authorInfo.name}</span>
                        <Space size={4}>
                          {talk.isTop === 1 && (
                            <Tag color="red" icon={<VerticalAlignTopOutlined />} className="mb-0">
                              置顶
                            </Tag>
                          )}
                          <Tag color={getStatusColor(talk.status)} className="mb-0">
                            {getStatusLabel(talk.status)}
                          </Tag>
                        </Space>
                      </div>
                    </div>
                    <ActionMenu
                      talk={talk}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onRefresh={loadTalks}
                    />
                  </div>

                  {/* 内容区域 */}
                  <TalkContent content={talk.content} />

                  {/* 图片网格 */}
                  <TalkImages images={talk.images} />

                  {/* 元信息 */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <Space size={16} className="text-sm text-gray-500">
                        <span>❤️ {talk.likeCount || 0}</span>
                        <span>💬 {talk.commentCount || 0}</span>
                      </Space>
                      <span className="text-xs text-gray-400">{talk.createTime}</span>
                    </div>

                    {/* 访客信息 */}
                    {(talk.city || talk.device || talk.browser) && (
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                        {talk.city && (
                          <Tooltip title={`${talk.country || ''} ${talk.province || ''} ${talk.city}`.trim()}>
                            <span className="flex items-center gap-1">
                              <EnvironmentOutlined />
                              {[talk.province, talk.city].filter(Boolean).join(' ')}
                            </span>
                          </Tooltip>
                        )}
                        {talk.device && (
                          <Tooltip title={talk.device}>
                            <span className="flex items-center gap-1">
                              <MobileOutlined />
                              {talk.device}
                            </span>
                          </Tooltip>
                        )}
                        {talk.browser && (
                          <Tooltip title={talk.browser}>
                            <span className="flex items-center gap-1">
                              <GlobalOutlined />
                              {talk.browser}
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* 分页 */}
        {!loading && talks.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button
              disabled={pagination.current <= 1}
              onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
            >
              上一页
            </Button>
            <span className="mx-4 text-sm text-gray-500">
              第 {pagination.current} 页 / 共 {Math.ceil(pagination.total / pagination.pageSize)} 页
            </span>
            <Button
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TalkPage
