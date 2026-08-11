import { useState, useEffect, useCallback } from 'react'
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
  ReloadOutlined,
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
import {
  GuestbookReviewStatus,
  GuestbookVisibilityStatus,
  GUESTBOOK_REVIEW_STATUS_MAP,
  GUESTBOOK_VISIBILITY_STATUS_MAP,
} from '@/types/enums'
import { getFullUrl } from '@/utils/format'

const GuestbookPage: React.FC = () => {
  const [guestbooks, setGuestbooks] = useState<Guestbook[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const [searchForm, setSearchForm] = useState<{
    status: GuestbookReviewStatus | undefined
    keyword: string
    id: number | undefined
    userId: number | undefined
    nickname: string
    email: string
    qq: string
    isVisible: GuestbookVisibilityStatus | undefined
    country: string
    province: string
    city: string
    type: string
    ip: string
    device: string
    browser: string
    location: string
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
    type: '',
    ip: '',
    device: '',
    browser: '',
    location: '',
  })

  const [activeFilters, setActiveFilters] = useState<{
    status: GuestbookReviewStatus | undefined
    keyword: string
    id: number | undefined
    userId: number | undefined
    nickname: string
    email: string
    qq: string
    isVisible: GuestbookVisibilityStatus | undefined
    country: string
    province: string
    city: string
    type: string
    ip: string
    device: string
    browser: string
    location: string
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
    type: '',
    ip: '',
    device: '',
    browser: '',
    location: '',
  })

  const [detailVisible, setDetailVisible] = useState(false)
  const [currentGuestbook, setCurrentGuestbook] = useState<Guestbook | null>(null)

  const loadGuestbooks = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getGuestbookList({
        page: current,
        size: pageSize,
        status: activeFilters.status,
        id: activeFilters.id,
        userId: activeFilters.userId,
        nickname: activeFilters.nickname,
        email: activeFilters.email,
        qq: activeFilters.qq,
        isVisible: activeFilters.isVisible,
        keyword: activeFilters.keyword,
        country: activeFilters.country,
        province: activeFilters.province,
        city: activeFilters.city,
        type: activeFilters.type,
        ip: activeFilters.ip,
        device: activeFilters.device,
        browser: activeFilters.browser,
        location: activeFilters.location,
      })
      setGuestbooks(result.records)
      setTotal(result.total)
    } catch (error) {
      console.error('加载留言失败', error)
    } finally {
      setLoading(false)
    }
  }, [current, pageSize, activeFilters])

  const handleSearch = () => {
    setCurrent(1)
    setActiveFilters({ ...searchForm })
  }

  const handleReset = () => {
    const empty = {
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
      type: '',
      ip: '',
      device: '',
      browser: '',
      location: '',
    }
    setSearchForm(empty)
    setCurrent(1)
    setActiveFilters(empty)
  }

  useEffect(() => {
    loadGuestbooks()
  }, [loadGuestbooks])

  const handleApprove = async (id: number) => {
    try {
      await approveGuestbook(id)
      message.success('审核通过')
      loadGuestbooks()
    } catch {
      message.error('操作失败')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await rejectGuestbook(id)
      message.success('已拒绝')
      loadGuestbooks()
    } catch {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteGuestbook(id)
      message.success('删除成功')
      loadGuestbooks()
    } catch {
      message.error('删除失败')
    }
  }

  const handleToggleVisible = async (id: number, visible: GuestbookVisibilityStatus) => {
    try {
      if (visible === GuestbookVisibilityStatus.VISIBLE) {
        await setHiddenGuestbook(id)
        message.success('已隐藏')
      } else {
        await setVisibleGuestbook(id)
        message.success('已设置为可见')
      }
      loadGuestbooks()
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      console.error('切换可见状态失败:', error)
      message.error(err?.response?.data?.message || err?.message || '操作失败')
    }
  }

  const getStatusTag = (status: GuestbookReviewStatus) => {
    const statusConfig = GUESTBOOK_REVIEW_STATUS_MAP[status as keyof typeof GUESTBOOK_REVIEW_STATUS_MAP]
    const { color, label } = statusConfig || { color: 'default', label: '未知' }
    return <Tag color={color}>{label}</Tag>
  }

  const getVisibilityTag = (isVisible: GuestbookVisibilityStatus) => {
    const visibilityConfig =
      GUESTBOOK_VISIBILITY_STATUS_MAP[isVisible as keyof typeof GUESTBOOK_VISIBILITY_STATUS_MAP]
    const { color, label } = visibilityConfig || { color: 'default', label: '未知' }
    const icon = isVisible === GuestbookVisibilityStatus.VISIBLE ? <EyeOutlined /> : <EyeInvisibleOutlined />

    return (
      <Tag icon={icon} color={color}>
        {label}
      </Tag>
    )
  }

  const getReviewStatus = (record: Guestbook) =>
    record.reviewStatus ?? record.status ?? GuestbookReviewStatus.PENDING

  const getVisibilityStatus = (record: Guestbook) =>
    record.isVisible ?? GuestbookVisibilityStatus.HIDDEN

  const isPendingReview = (record: Guestbook) =>
    getReviewStatus(record) === GuestbookReviewStatus.PENDING

  const isVisibleGuestbook = (record: Guestbook) =>
    getVisibilityStatus(record) === GuestbookVisibilityStatus.VISIBLE

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
      render: (_: unknown, record: Guestbook) => (
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
      render: (_: unknown, record: Guestbook) => (
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
      render: (_: unknown, record: Guestbook) => (
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
      render: (_: unknown, record: Guestbook) => (
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
      render: (_: unknown, record: Guestbook) => (
        <Space direction="vertical" size="small">
          {getStatusTag(getReviewStatus(record))}
          {getVisibilityTag(getVisibilityStatus(record))}
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
      render: (_: unknown, record: Guestbook) => (
        <Space size="small">
          <Tooltip title={isVisibleGuestbook(record) ? '设置为隐藏' : '设置为可见'}>
            <Button
              type="text"
              icon={isVisibleGuestbook(record) ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              className={isVisibleGuestbook(record) ? 'text-gray-500' : 'text-green-500'}
              onClick={() => handleToggleVisible(record.id, getVisibilityStatus(record))}
            />
          </Tooltip>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => showDetail(record)}
            />
          </Tooltip>
          {isPendingReview(record) && (
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
            value={searchForm.status}
            onChange={(value) => setSearchForm({ ...searchForm, status: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={GuestbookReviewStatus.PENDING}>待审核</Select.Option>
            <Select.Option value={GuestbookReviewStatus.APPROVED}>已通过</Select.Option>
            <Select.Option value={GuestbookReviewStatus.REJECTED}>已拒绝</Select.Option>
          </Select>
          <Select
            placeholder="可见状态"
            value={searchForm.isVisible}
            onChange={(value) => setSearchForm({ ...searchForm, isVisible: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={GuestbookVisibilityStatus.VISIBLE}>可见</Select.Option>
            <Select.Option value={GuestbookVisibilityStatus.HIDDEN}>隐藏</Select.Option>
          </Select>
          <Input
            placeholder="搜索留言内容"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchForm.keyword}
            onChange={(e) => setSearchForm({ ...searchForm, keyword: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
            allowClear
          />
          <Input
            placeholder="昵称"
            value={searchForm.nickname}
            onChange={(e) => setSearchForm({ ...searchForm, nickname: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 140 }}
            allowClear
          />
          <Input
            placeholder="邮箱"
            value={searchForm.email}
            onChange={(e) => setSearchForm({ ...searchForm, email: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 180 }}
            allowClear
          />
          <Input
            placeholder="QQ号"
            value={searchForm.qq}
            onChange={(e) => setSearchForm({ ...searchForm, qq: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 120 }}
            allowClear
          />
          <Input
            placeholder="留言ID"
            value={searchForm.id || ''}
            onChange={(e) => setSearchForm({ ...searchForm, id: e.target.value ? Number(e.target.value) : undefined })}
            onPressEnter={handleSearch}
            style={{ width: 120 }}
            type="number"
            allowClear
          />
          <Input
            placeholder="用户ID"
            value={searchForm.userId || ''}
            onChange={(e) => setSearchForm({ ...searchForm, userId: e.target.value ? Number(e.target.value) : undefined })}
            onPressEnter={handleSearch}
            style={{ width: 120 }}
            type="number"
            allowClear
          />
          <Input
            placeholder="国家"
            value={searchForm.country}
            onChange={(e) => setSearchForm({ ...searchForm, country: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 120 }}
            allowClear
          />
          <Input
            placeholder="省份"
            value={searchForm.province}
            onChange={(e) => setSearchForm({ ...searchForm, province: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 120 }}
            allowClear
          />
          <Input
            placeholder="城市"
            value={searchForm.city}
            onChange={(e) => setSearchForm({ ...searchForm, city: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 120 }}
            allowClear
          />
          <Input
            placeholder="留言类型"
            value={searchForm.type}
            onChange={(e) => setSearchForm({ ...searchForm, type: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 120 }}
            allowClear
          />
          <Input
            placeholder="IP"
            value={searchForm.ip}
            onChange={(e) => setSearchForm({ ...searchForm, ip: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 140 }}
            allowClear
          />
          <Input
            placeholder="设备"
            value={searchForm.device}
            onChange={(e) => setSearchForm({ ...searchForm, device: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 140 }}
            allowClear
          />
          <Input
            placeholder="浏览器"
            value={searchForm.browser}
            onChange={(e) => setSearchForm({ ...searchForm, browser: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 140 }}
            allowClear
          />
          <Input
            placeholder="位置"
            value={searchForm.location}
            onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 160 }}
            allowClear
          />
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
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
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条留言`,
            onChange: (page, size) => {
              setCurrent(page)
              setPageSize(size)
            },
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
                {getStatusTag(getReviewStatus(currentGuestbook))}
              </Descriptions.Item>
              {currentGuestbook.isVisible !== undefined && (
                <Descriptions.Item label="可见状态">
                  {getVisibilityTag(getVisibilityStatus(currentGuestbook))}
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
                  icon={isVisibleGuestbook(currentGuestbook) ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => {
                    handleToggleVisible(currentGuestbook.id, getVisibilityStatus(currentGuestbook))
                    setDetailVisible(false)
                  }}
                >
                  {isVisibleGuestbook(currentGuestbook) ? '设置为隐藏' : '设置为可见'}
                </Button>
              )}
              {isPendingReview(currentGuestbook) && (
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
