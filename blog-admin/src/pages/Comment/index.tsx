import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Select,
  Tag,
  Avatar,
  Tooltip,
  Input,
  Drawer,
  Image,
  Divider,
  Descriptions,
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  EnvironmentOutlined,
  MobileOutlined,
  CommentOutlined,
  FileImageOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { getCommentList, approveComment, rejectComment, deleteComment, setVisibleComment, setHiddenComment } from '@/api/comment'
import { Comment } from '@/types'
import { getFullUrl } from '@/utils/format'

const CommentPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState<{
    status: number | undefined
    keyword: string
    id: number | undefined
    parentId: number | undefined
    rootId: number | undefined
    targetType: string | undefined
    isVisible: number | undefined
  }>({
    status: undefined,
    keyword: '',
    id: undefined,
    parentId: undefined,
    rootId: undefined,
    targetType: undefined,
    isVisible: undefined,
  })
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentComment, setCurrentComment] = useState<Comment | null>(null)

  useEffect(() => {
    loadComments()
  }, [pagination.current, pagination.pageSize])

  const loadComments = async () => {
    setLoading(true)
    try {
      const result = await getCommentList({
        page: pagination.current,
        size: pagination.pageSize,
        status: filters.status,
        id: filters.id,
        parentId: filters.parentId,
        rootId: filters.rootId,
        targetType: filters.targetType,
        isVisible: filters.isVisible,
        keyword: filters.keyword,
      })
      setComments(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('加载评论失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await approveComment(id)
      message.success('审核通过')
      loadComments()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await rejectComment(id)
      message.success('已拒绝')
      loadComments()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteComment(id)
      message.success('删除成功')
      loadComments()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleToggleVisible = async (id: number, visible: number) => {
    try {
      if (visible === 1) {
        await setHiddenComment(id)
        message.success('已隐藏')
      } else {
        await setVisibleComment(id)
        message.success('已设置为可见')
      }
      loadComments()
    } catch (error: any) {
      console.error('切换可见状态失败:', error)
      message.error(error?.response?.data?.message || error?.message || '操作失败')
    }
  }

  const getStatusTag = (status: number) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      0: { color: 'warning', text: '待审核' },
      1: { color: 'success', text: '已通过' },
      2: { color: 'error', text: '已拒绝' },
    }
    const { color, text } = statusMap[status] || { color: 'default', text: '未知' }
    return <Tag color={color}>{text}</Tag>
  }

  const showDetail = (comment: Comment) => {
    setCurrentComment(comment)
    setDetailVisible(true)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => (
        <span className="text-sm font-mono text-gray-600">{id}</span>
      ),
    },
    {
      title: '评论者',
      key: 'author',
      width: 220,
      render: (_: any, record: Comment) => (
        <div className="flex gap-2 items-center">
          <Avatar src={getFullUrl(record.authorAvatar)} icon={<UserOutlined />} size={40} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{record.authorName || '匿名'}</div>
            <div className="text-xs text-gray-400 truncate">{record.authorEmail || '暂无邮箱'}</div>
            {record.qq && (
              <Tooltip title={`QQ: ${record.qq}`}>
                <div className="text-xs text-blue-500 flex items-center gap-1">
                  <span>QQ: {record.qq}</span>
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '评论内容',
      key: 'content',
      width: 280,
      render: (_: any, record: Comment) => (
        <div>
          <div className="truncate mb-1">{record.content}</div>
          <div className="flex gap-1 items-center flex-wrap">
            {record.images && record.images.length > 0 && (
              <Tag icon={<FileImageOutlined />} color="blue">
                {record.images.length}张图片
              </Tag>
            )}
            {record.parentId?  record.rootId && (
              <Tag color="orange">根#{record.rootId}</Tag>
            ):''}
            {record.parentId ? (
              <Tag icon={<CommentOutlined />} color="purple">
                回复 #{record.parentId}
              </Tag>
            ):''}
            {record.replyCount > 0 && (
              <Tag color="cyan">{record.replyCount} 条回复</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '评论目标',
      key: 'target',
      width: 250,
      render: (_: any, record: Comment) => {
        const title = record.targetTitle || record.postTitle || '未知'
        const targetType = record.targetType || 'ARTICLE'
        const isTalk = targetType === 'TALK'
        const targetId = record.targetId

        return (
          <Tooltip title={`${title} #${targetId}`}>
            <div className="flex items-center gap-1">
              <Tag color={isTalk ? 'purple' : 'blue'}>
                {isTalk ? '说说' : '文章'}
              </Tag>
              <span className="text-xs text-gray-500">
                #{targetId}
              </span>
              {isTalk ? (
                <span className="text-gray-600 truncate">
                  {title}
                </span>
              ) : (
                <span className="text-blue-500 cursor-pointer hover:underline truncate">
                  {title}
                </span>
              )}
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: '位置',
      key: 'location',
      width: 150,
      render: (_: any, record: Comment) => (
        <div className="text-xs">
          {record.country || record.province || record.city ? (
            <div className="flex items-center gap-1" title={`${record.country || ''} ${record.province || ''} ${record.city || ''}`}>
              <EnvironmentOutlined className="text-gray-400" />
              <span className="truncate">
                {[record.city, record.province, record.country]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
          {record.ip && (
            <div className="text-gray-400 truncate mt-1" title={record.ip}>
              {record.ip}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '设备',
      key: 'device',
      width: 120,
      render: (_: any, record: Comment) => (
        <div className="text-xs">
          {record.device || record.browser ? (
            <div>
              {record.device && (
                <div className="flex items-center gap-1 truncate">
                  <MobileOutlined className="text-gray-400" />
                  <span>{record.device}</span>
                </div>
              )}
              {record.browser && (
                <div className="text-gray-500 truncate mt-1">{record.browser}</div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_: any, record: Comment) => (
        <Space direction="vertical" size="small">
          {getStatusTag(record.status)}
          <Tag
            icon={record.isVisible === 1 ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            color={record.isVisible === 1 ? 'success' : 'default'}
          >
            {record.isVisible === 1 ? '可见' : '隐藏'}
          </Tag>
        </Space>
      ),
    },
    {
      title: '评论时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: any, record: Comment) => (
        <Space size="small">
          <Tooltip title={record.isVisible === 1 ? '设置为隐藏' : '设置为可见'}>
            <Button
              type="text"
              icon={record.isVisible === 1 ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              className={record.isVisible === 1 ? 'text-gray-500' : 'text-green-500'}
              onClick={() => handleToggleVisible(record.id, record.isVisible!)}
            />
          </Tooltip>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => showDetail(record)}
            />
          </Tooltip>
          {record.status === 0 && (
            <>
              <Tooltip title="通过">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  className="text-green-500"
                  onClick={() => handleApprove(record.id)}
                />
              </Tooltip>
              <Tooltip title="拒绝">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  className="text-orange-500"
                  onClick={() => handleReject(record.id)}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm title="确定删除这条评论吗？" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="search-bar">
        <div className="flex gap-4 items-center flex-wrap">
          <Input
            placeholder="搜索评论内容"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={{ width: 200 }}
            allowClear
          />
          <Input
            placeholder="评论ID"
            value={filters.id || ''}
            onChange={(e) => setFilters({ ...filters, id: e.target.value ? Number(e.target.value) : undefined })}
            style={{ width: 120 }}
            type="number"
            allowClear
          />
          <Input
            placeholder="父评论ID"
            value={filters.parentId || ''}
            onChange={(e) => setFilters({ ...filters, parentId: e.target.value ? Number(e.target.value) : undefined })}
            style={{ width: 120 }}
            type="number"
            allowClear
          />
          <Input
            placeholder="根评论ID"
            value={filters.rootId || ''}
            onChange={(e) => setFilters({ ...filters, rootId: e.target.value ? Number(e.target.value) : undefined })}
            style={{ width: 120 }}
            type="number"
            allowClear
          />
          <Select
            placeholder="评论状态"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={0}>待审核</Select.Option>
            <Select.Option value={1}>已通过</Select.Option>
            <Select.Option value={2}>已拒绝</Select.Option>
          </Select>
          <Select
            placeholder="评论类型"
            value={filters.targetType}
            onChange={(value) => setFilters({ ...filters, targetType: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value="ARTICLE">文章</Select.Option>
            <Select.Option value="TALK">说说</Select.Option>
          </Select>
          <Select
            placeholder="可见状态"
            value={filters.isVisible}
            onChange={(value) => setFilters({ ...filters, isVisible: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={1}>可见</Select.Option>
            <Select.Option value={0}>隐藏</Select.Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={loadComments}>
            搜索
          </Button>
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={comments}
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
            showTotal: (total) => `共 ${total} 条评论`,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
          scroll={{ x: 1500 }}
        />
      </div>

      <Drawer
        title="评论详情"
        placement="right"
        width={600}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {currentComment && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="评论ID">{currentComment.id}</Descriptions.Item>
              <Descriptions.Item label="评论者信息">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={getFullUrl(currentComment.authorAvatar)}
                    icon={<UserOutlined />}
                    size={48}
                  />
                  <div className="flex-1">
                    <div className="font-medium mb-1">{currentComment.authorName || '匿名'}</div>
                    <div className="text-sm text-gray-500 mb-1">
                      {currentComment.authorEmail || '暂无邮箱'}
                    </div>
                    {currentComment.qq && (
                      <div className="text-sm text-blue-500">
                        QQ: {currentComment.qq}
                      </div>
                    )}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="评论内容">
                <div className="whitespace-pre-wrap">{currentComment.content}</div>
              </Descriptions.Item>
              {currentComment.images && currentComment.images.length > 0 && (
                <Descriptions.Item label="图片">
                  <Image.PreviewGroup>
                    <Space wrap>
                      {currentComment.images.map((img, index) => (
                        <Image
                          key={index}
                          src={getFullUrl(img)}
                          width={100}
                          height={100}
                          style={{ objectFit: 'cover' }}
                        />
                      ))}
                    </Space>
                  </Image.PreviewGroup>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="评论目标">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Tag color={currentComment.targetType === 'ARTICLE' ? 'blue' : 'purple'}>
                      {currentComment.targetType === 'ARTICLE' ? '文章' : '说说'}
                    </Tag>
                    <span className="text-sm text-gray-500">
                      #{currentComment.targetId}
                    </span>
                  </div>
                  <div>
                    {currentComment.targetType === 'TALK' ? (
                      <span className="text-gray-700">
                        {currentComment.targetTitle || currentComment.postTitle || '未知'}
                      </span>
                    ) : (
                      <span className="text-blue-500">
                        {currentComment.targetTitle || currentComment.postTitle || '未知'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    类型: {currentComment.targetType}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="评论状态">
                {getStatusTag(currentComment.status)}
              </Descriptions.Item>
              {currentComment.isVisible !== undefined && (
                <Descriptions.Item label="可见状态">
                  <Tag
                    icon={currentComment.isVisible === 1 ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    color={currentComment.isVisible === 1 ? 'success' : 'default'}
                  >
                    {currentComment.isVisible === 1 ? '可见' : '隐藏'}
                  </Tag>
                </Descriptions.Item>
              )}
              {currentComment.parentId && (
                <Descriptions.Item label="回复对象">
                  <Tag color="purple" icon={<CommentOutlined />}>
                    父评论 #{currentComment.parentId}
                  </Tag>
                </Descriptions.Item>
              )}
              {currentComment.rootId && (
                <Descriptions.Item label="根评论ID">
                  <Tag color="orange">#{currentComment.rootId}</Tag>
                </Descriptions.Item>
              )}
              {currentComment.replyCount > 0 && (
                <Descriptions.Item label="回复数量">
                  <Tag color="cyan">{currentComment.replyCount} 条</Tag>
                </Descriptions.Item>
              )}
              {currentComment.ip && (
                <Descriptions.Item label="IP地址">{currentComment.ip}</Descriptions.Item>
              )}
              {(currentComment.country || currentComment.province || currentComment.city) && (
                <Descriptions.Item label="地理位置">
                  <div>
                    {currentComment.country && <div>国家: {currentComment.country}</div>}
                    {currentComment.province && <div>省份: {currentComment.province}</div>}
                    {currentComment.city && <div>城市: {currentComment.city}</div>}
                    {currentComment.location && <div>详细位置: {currentComment.location}</div>}
                  </div>
                </Descriptions.Item>
              )}
              {currentComment.device && (
                <Descriptions.Item label="设备">{currentComment.device}</Descriptions.Item>
              )}
              {currentComment.browser && (
                <Descriptions.Item label="浏览器">{currentComment.browser}</Descriptions.Item>
              )}
              <Descriptions.Item label="评论时间">{currentComment.createTime}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Space>
              {currentComment.isVisible !== undefined && (
                <Button
                  icon={currentComment.isVisible === 1 ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => {
                    handleToggleVisible(currentComment.id, currentComment.isVisible!)
                    setDetailVisible(false)
                  }}
                >
                  {currentComment.isVisible === 1 ? '设置为隐藏' : '设置为可见'}
                </Button>
              )}
              {currentComment.status === 0 && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      handleApprove(currentComment.id)
                      setDetailVisible(false)
                    }}
                  >
                    审核通过
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => {
                      handleReject(currentComment.id)
                      setDetailVisible(false)
                    }}
                  >
                    审核拒绝
                  </Button>
                </>
              )}
              <Popconfirm
                title="确定删除这条评论吗？"
                onConfirm={() => {
                  handleDelete(currentComment.id)
                  setDetailVisible(false)
                }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除评论
                </Button>
              </Popconfirm>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default CommentPage
