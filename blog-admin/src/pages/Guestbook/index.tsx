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
  Image,
  Drawer,
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
  FileImageOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import {
  getGuestbookList,
  approveGuestbook,
  rejectGuestbook,
  deleteGuestbook,
  setVisibleGuestbook,
  setHiddenGuestbook,
} from '@/api/guestbook'
import { Guestbook } from '@/types'
import { getFullUrl } from '@/utils/format'

const GuestbookPage: React.FC = () => {
  const [guestbooks, setGuestbooks] = useState<Guestbook[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState<{
    status: number | undefined
    keyword: string
    id: number | undefined
    userId: number | undefined
    nickname: string
    email: string
    qq: string
    isVisible: number | undefined
    country: string
    province: string
    city: string
  }>({
    status: undefined,
    keyword: '',
    id: undefined,
    userId: undefined,
    nickname: '',
    email: '',
    qq: '',
    isVisible: undefined,
    country: '',
    province: '',
    city: '',
  })
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentGuestbook, setCurrentGuestbook] = useState<Guestbook | null>(null)

  useEffect(() => {
    loadGuestbooks()
  }, [pagination.current, pagination.pageSize])

  const loadGuestbooks = async () => {
    setLoading(true)
    try {
      const result = await getGuestbookList({
        page: pagination.current,
        size: pagination.pageSize,
        status: filters.status,
        id: filters.id,
        userId: filters.userId,
        nickname: filters.nickname,
        email: filters.email,
        qq: filters.qq,
        isVisible: filters.isVisible,
        keyword: filters.keyword,
        country: filters.country,
        province: filters.province,
        city: filters.city,
      })
      setGuestbooks(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('加载留言失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await approveGuestbook(id)
      message.success('审核通过')
      loadGuestbooks()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await rejectGuestbook(id)
      message.success('已拒绝')
      loadGuestbooks()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteGuestbook(id)
      message.success('删除成功')
      loadGuestbooks()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleToggleVisible = async (id: number, visible: number) => {
    try {
      if (visible === 1) {
        await setHiddenGuestbook(id)
        message.success('已隐藏')
      } else {
        await setVisibleGuestbook(id)
        message.success('已设置为可见')
      }
      loadGuestbooks()
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

  const showDetail = (guestbook: Guestbook) => {
    setCurrentGuestbook(guestbook)
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
      title: '留言者',
      key: 'author',
      width: 220,
      render: (_: any, record: Guestbook) => (
        <div className="flex gap-2 items-center">
          <Avatar src={getFullUrl(record.avatar)} icon={<UserOutlined />} size={40} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{record.nickname || '匿名'}</div>
            <div className="text-xs text-gray-400 truncate">{record.email || '暂无邮箱'}</div>
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
      title: '留言内容',
      key: 'content',
      width: 280,
      render: (_: any, record: Guestbook) => (
        <div>
          <div className="truncate mb-1">{record.content}</div>
          {record.images && record.images.length > 0 && (
            <Tag icon={<FileImageOutlined />} color="blue">
              {record.images.length}张图片
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '位置',
      key: 'location',
      width: 150,
      render: (_: any, record: Guestbook) => (
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
      render: (_: any, record: Guestbook) => (
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
      render: (_: any, record: Guestbook) => (
        <Space direction="vertical" size="small">
          {getStatusTag(record.reviewStatus ?? record.status)}
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
      title: '留言时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: any, record: Guestbook) => (
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
          {(record.reviewStatus === 0 || record.status === 0) && (
            <>
              <Popconfirm title="确定通过这条留言吗？" onConfirm={() => handleApprove(record.id)}>
                <Tooltip title="通过">
                  <Button
                    type="text"
                    icon={<CheckOutlined />}
                    className="text-green-500"
                  />
                </Tooltip>
              </Popconfirm>
              <Popconfirm title="确定拒绝这条留言吗？" onConfirm={() => handleReject(record.id)}>
                <Tooltip title="拒绝">
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    className="text-orange-500"
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
          <Popconfirm title="确定删除这条留言吗？" onConfirm={() => handleDelete(record.id)}>
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
          <Select
            placeholder="审核状态"
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
            placeholder="可见状态"
            value={filters.isVisible}
            onChange={(value) => setFilters({ ...filters, isVisible: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={1}>可见</Select.Option>
            <Select.Option value={0}>隐藏</Select.Option>
          </Select>
          <Input
            placeholder="搜索留言内容"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={{ width: 200 }}
            allowClear
          />
          <Input
            placeholder="昵称"
            value={filters.nickname}
            onChange={(e) => setFilters({ ...filters, nickname: e.target.value })}
            style={{ width: 140 }}
            allowClear
          />
          <Input
            placeholder="邮箱"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            style={{ width: 180 }}
            allowClear
          />
          <Input
            placeholder="QQ号"
            value={filters.qq}
            onChange={(e) => setFilters({ ...filters, qq: e.target.value })}
            style={{ width: 120 }}
            allowClear
          />
          <Input
            placeholder="留言ID"
            value={filters.id || ''}
            onChange={(e) => setFilters({ ...filters, id: e.target.value ? Number(e.target.value) : undefined })}
            style={{ width: 120 }}
            type="number"
            allowClear
          />
          <Input
            placeholder="用户ID"
            value={filters.userId || ''}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value ? Number(e.target.value) : undefined })}
            style={{ width: 120 }}
            type="number"
            allowClear
          />
          <Input
            placeholder="国家"
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            style={{ width: 120 }}
            allowClear
          />
          <Input
            placeholder="省份"
            value={filters.province}
            onChange={(e) => setFilters({ ...filters, province: e.target.value })}
            style={{ width: 120 }}
            allowClear
          />
          <Input
            placeholder="城市"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            style={{ width: 120 }}
            allowClear
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={loadGuestbooks}>
            搜索
          </Button>
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={guestbooks}
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
            showTotal: (total) => `共 ${total} 条留言`,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
          scroll={{ x: 1500 }}
        />
      </div>

      <Drawer
        title="留言详情"
        placement="right"
        width={600}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {currentGuestbook && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="留言ID">{currentGuestbook.id}</Descriptions.Item>
              <Descriptions.Item label="留言者信息">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={getFullUrl(currentGuestbook.avatar)}
                    icon={<UserOutlined />}
                    size={48}
                  />
                  <div className="flex-1">
                    <div className="font-medium mb-1">{currentGuestbook.nickname || '匿名'}</div>
                    <div className="text-sm text-gray-500 mb-1">
                      {currentGuestbook.email || '暂无邮箱'}
                    </div>
                    {currentGuestbook.qq && (
                      <div className="text-sm text-blue-500">
                        QQ: {currentGuestbook.qq}
                      </div>
                    )}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="留言内容">
                <div className="whitespace-pre-wrap">{currentGuestbook.content}</div>
              </Descriptions.Item>
              {currentGuestbook.images && currentGuestbook.images.length > 0 && (
                <Descriptions.Item label="图片">
                  <Image.PreviewGroup>
                    <Space wrap>
                      {currentGuestbook.images.map((img, index) => (
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
              <Descriptions.Item label="审核状态">
                {getStatusTag(currentGuestbook.reviewStatus)}
              </Descriptions.Item>
              {currentGuestbook.isVisible !== undefined && (
                <Descriptions.Item label="可见状态">
                  <Tag
                    icon={currentGuestbook.isVisible === 1 ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    color={currentGuestbook.isVisible === 1 ? 'success' : 'default'}
                  >
                    {currentGuestbook.isVisible === 1 ? '可见' : '隐藏'}
                  </Tag>
                </Descriptions.Item>
              )}
              {currentGuestbook.ip && (
                <Descriptions.Item label="IP地址">{currentGuestbook.ip}</Descriptions.Item>
              )}
              {(currentGuestbook.country || currentGuestbook.province || currentGuestbook.city) && (
                <Descriptions.Item label="地理位置">
                  <div>
                    {currentGuestbook.country && <div>国家: {currentGuestbook.country}</div>}
                    {currentGuestbook.province && <div>省份: {currentGuestbook.province}</div>}
                    {currentGuestbook.city && <div>城市: {currentGuestbook.city}</div>}
                    {currentGuestbook.location && <div>详细位置: {currentGuestbook.location}</div>}
                  </div>
                </Descriptions.Item>
              )}
              {currentGuestbook.device && (
                <Descriptions.Item label="设备">{currentGuestbook.device}</Descriptions.Item>
              )}
              {currentGuestbook.browser && (
                <Descriptions.Item label="浏览器">{currentGuestbook.browser}</Descriptions.Item>
              )}
              <Descriptions.Item label="留言时间">{currentGuestbook.createTime}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Space>
              {currentGuestbook.isVisible !== undefined && (
                <Button
                  icon={currentGuestbook.isVisible === 1 ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => {
                    handleToggleVisible(currentGuestbook.id, currentGuestbook.isVisible!)
                    setDetailVisible(false)
                  }}
                >
                  {currentGuestbook.isVisible === 1 ? '设置为隐藏' : '设置为可见'}
                </Button>
              )}
              {(currentGuestbook.reviewStatus === 0 || currentGuestbook.status === 0) && (
                <>
                  <Popconfirm
                    title="确定通过这条留言吗？"
                    onConfirm={() => {
                      handleApprove(currentGuestbook.id)
                      setDetailVisible(false)
                    }}
                  >
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                    >
                      审核通过
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="确定拒绝这条留言吗？"
                    onConfirm={() => {
                      handleReject(currentGuestbook.id)
                      setDetailVisible(false)
                    }}
                  >
                    <Button
                      icon={<CloseOutlined />}
                    >
                      审核拒绝
                    </Button>
                  </Popconfirm>
                </>
              )}
              <Popconfirm
                title="确定删除这条留言吗？"
                onConfirm={() => {
                  handleDelete(currentGuestbook.id)
                  setDetailVisible(false)
                }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除留言
                </Button>
              </Popconfirm>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default GuestbookPage
