import { useState, useEffect } from 'react'
import { Table, Card, Row, Col, Statistic, Tag, DatePicker, Space, Tooltip, Input, Select, Button, Drawer, Descriptions, Divider, Empty, List } from 'antd'
import {
  UserOutlined,
  EyeOutlined,
  GlobalOutlined,
  DesktopOutlined,
  ApartmentOutlined,
  ChromeOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import { getVisitorList, getVisitorSessionPages, getVisitorStatistics, getVisitorTrackingDetail } from '@/api/visitor'
import { getStatisticsTopLandingPages, getStatisticsTrafficSources } from '@/api/statistics'
import { LandingPageItem, TrafficSourceItem, Visitor, VisitorPageTrace, VisitorSessionTrace, VisitorStatistics, VisitorTrackingDetail } from '@/types'
import PieChart from '@/components/Chart/PieChart'
import BarChart from '@/components/Chart/BarChart'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const DEFAULT_SESSION_LIMIT = 20

const getTrafficSourceColor = (source?: string) => {
  switch (source) {
    case 'DIRECT':
      return 'blue'
    case 'SEARCH':
      return 'green'
    case 'UTM':
      return 'gold'
    case 'REFERRAL':
      return 'purple'
    default:
      return 'default'
  }
}

const getDisplayUrl = (value?: string, fallback?: string) => {
  if (!value) return fallback || '-'
  try {
    const parsed = new URL(value)
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || parsed.href
  } catch {
    return value
  }
}

const getHost = (value?: string) => {
  if (!value) return ''
  try {
    return new URL(value).host
  } catch {
    return ''
  }
}

const buildSessionKey = (visitorId: number, sessionId: string) => `${visitorId}:${sessionId}`

const buildStatsRange = (statRange: [string | null, string | null]) => {
  const [startDate, endDate] = statRange
  return {
    start: startDate || '1970-01-01T00:00:00',
    end: endDate || dayjs().format('YYYY-MM-DDTHH:mm:ss'),
  }
}

const renderPageKey = (pageKey?: string) => {
  const [type, ...rest] = String(pageKey || '').split(':')
  const key = rest.join(':')
  const tagColor = type === 'ARTICLE' ? 'blue' : type === 'TALK' ? 'gold' : 'default'

  return (
    <Space>
      <Tag color={tagColor}>{type || 'PAGE'}</Tag>
      <span>{key || pageKey || '-'}</span>
    </Space>
  )
}

const renderUrlBlock = (value?: string, fallback?: string) => {
  const displayValue = getDisplayUrl(value, fallback)
  const host = getHost(value)

  return (
    <Space size={4} direction="vertical">
      <span>{displayValue}</span>
      {host && <span className="text-xs text-gray-400">{host}</span>}
    </Space>
  )
}

const VisitorPage: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [statistics, setStatistics] = useState<VisitorStatistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [sessionPagesLoadingKey, setSessionPagesLoadingKey] = useState<string | null>(null)
  const [trafficSourcesLoading, setTrafficSourcesLoading] = useState(false)
  const [landingPagesLoading, setLandingPagesLoading] = useState(false)
  const [currentVisitor, setCurrentVisitor] = useState<Visitor | null>(null)
  const [trackingDetail, setTrackingDetail] = useState<VisitorTrackingDetail | null>(null)
  const [selectedSession, setSelectedSession] = useState<VisitorSessionTrace | null>(null)
  const [sessionPagesMap, setSessionPagesMap] = useState<Record<string, VisitorPageTrace[]>>({})
  const [trafficSources, setTrafficSources] = useState<TrafficSourceItem[]>([])
  const [topLandingPages, setTopLandingPages] = useState<LandingPageItem[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [statRange, setStatRange] = useState<[string | null, string | null]>([null, null])
  const [landingPageOrderBy, setLandingPageOrderBy] = useState<'sessions' | 'uv'>('sessions')
  const [landingPageSource, setLandingPageSource] = useState<'ALL' | 'DIRECT' | 'SEARCH' | 'REFERRAL' | 'UTM'>('ALL')
  const [filters, setFilters] = useState<{
    country: string
    province: string
    city: string
    deviceType: string | undefined
    osName: string
    browserName: string
    trafficSource: string | undefined
  }>({
    country: '',
    province: '',
    city: '',
    deviceType: undefined,
    osName: '',
    browserName: '',
    trafficSource: undefined,
  })

  useEffect(() => {
    loadVisitors()
    loadStatistics()
  }, [pagination.current, pagination.pageSize])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    loadVisitors()
  }, [filters])

  useEffect(() => {
    loadStatistics()
  }, [statRange])

  useEffect(() => {
    loadTrafficInsights()
  }, [statRange, landingPageOrderBy, landingPageSource])

  const loadVisitors = async () => {
    setLoading(true)
    try {
      const result = await getVisitorList({
        page: pagination.current,
        size: pagination.pageSize,
        country: filters.country || undefined,
        province: filters.province || undefined,
        city: filters.city || undefined,
        deviceType: filters.deviceType || undefined,
        osName: filters.osName || undefined,
        browserName: filters.browserName || undefined,
        trafficSource: filters.trafficSource || undefined,
      })
      setVisitors(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('加载访客列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    setStatsLoading(true)
    try {
      const [startDate, endDate] = statRange
      const data = await getVisitorStatistics({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setStatistics(data)
    } catch (error) {
      console.error('加载统计数据失败', error)
    } finally {
    setStatsLoading(false)
    }
  }

  const loadTrafficInsights = async () => {
    const { start, end } = buildStatsRange(statRange)
    setTrafficSourcesLoading(true)
    setLandingPagesLoading(true)

    try {
      const [sources, landingPages] = await Promise.all([
        getStatisticsTrafficSources({ start, end }),
        getStatisticsTopLandingPages({
          start,
          end,
          limit: 10,
          orderBy: landingPageOrderBy,
          source: landingPageSource,
        }),
      ])
      setTrafficSources(sources || [])
      setTopLandingPages(landingPages || [])
    } catch (error) {
      console.error('加载来源与落地页分析失败', error)
    } finally {
      setTrafficSourcesLoading(false)
      setLandingPagesLoading(false)
    }
  }

  const loadSessionPages = async (visitorId: number, session: VisitorSessionTrace) => {
    const sessionKey = buildSessionKey(visitorId, session.sessionId)
    setSelectedSession(session)

    if (sessionPagesMap[sessionKey]) {
      return
    }

    setSessionPagesLoadingKey(sessionKey)
    try {
      const pages = await getVisitorSessionPages(visitorId, session.sessionId)
      setSessionPagesMap((prev) => ({ ...prev, [sessionKey]: pages }))
    } catch (error) {
      console.error('加载会话页面路径失败', error)
    } finally {
      setSessionPagesLoadingKey(null)
    }
  }

  const openTrackingDetail = async (visitor: Visitor) => {
    setDetailVisible(true)
    setCurrentVisitor(visitor)
    setTrackingDetail(null)
    setSelectedSession(null)
    setSessionPagesMap({})
    setDetailLoading(true)

    try {
      const detail = await getVisitorTrackingDetail(visitor.id, { limit: DEFAULT_SESSION_LIMIT })
      setTrackingDetail(detail)

      const initialSession = detail.latestSessions?.[0] || detail.firstSession
      if (initialSession) {
        await loadSessionPages(visitor.id, initialSession)
      }
    } catch (error) {
      console.error('加载访客轨迹失败', error)
    } finally {
      setDetailLoading(false)
    }
  }

  const columns = [
    {
      title: '访客标识',
      dataIndex: 'visitorUuid',
      key: 'visitorUuid',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
    },
    {
      title: '地区/ISP',
      key: 'location',
      width: 200,
      render: (_: any, record: Visitor) => (
        <div>
          <div>{[record.country, record.province, record.city, record.district].filter(Boolean).join(' / ') || '-'}</div>
          <div className="text-xs text-gray-400">{record.isp || record.timezone || '-'}</div>
        </div>
      ),
    },
    {
      title: '设备',
      key: 'device',
      width: 180,
      render: (_: any, record: Visitor) => (
        <div>
          <div>{record.deviceType || '-'}</div>
          <div className="text-xs text-gray-400">
            {[record.deviceBrand, record.deviceModel].filter(Boolean).join(' ')}
          </div>
        </div>
      ),
    },
    {
      title: '操作系统',
      key: 'os',
      width: 160,
      render: (_: any, record: Visitor) => (
        <span>{[record.osName, record.osVersion].filter(Boolean).join(' ') || '-'}</span>
      ),
    },
    {
      title: '浏览器',
      key: 'browser',
      width: 160,
      render: (_: any, record: Visitor) => (
        <span>{[record.browserName, record.browserVersion].filter(Boolean).join(' ') || '-'}</span>
      ),
    },
    {
      title: '来源',
      key: 'trafficSource',
      width: 160,
      render: (_: any, record: Visitor) => (
        <Space size={4} direction="vertical">
          <Tag color={getTrafficSourceColor(record.trafficSource)} style={{ marginBottom: 0 }}>
            {record.trafficSource || 'UNKNOWN'}
          </Tag>
          {record.refererUrl && (
            <Tooltip title={record.refererUrl}>
              <div className="text-xs text-gray-400 truncate max-w-[140px]">{record.refererUrl}</div>
            </Tooltip>
          )}
          {(record.utmSource || record.utmMedium || record.utmCampaign) && (
            <div className="text-xs text-gray-400">
              {[record.utmSource, record.utmMedium, record.utmCampaign].filter(Boolean).join(' / ')}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: '访问次数',
      dataIndex: 'visitCount',
      key: 'visitCount',
      width: 100,
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: '首次访问',
      dataIndex: 'firstVisitTime',
      key: 'firstVisitTime',
      width: 160,
    },
    {
      title: '最后访问',
      dataIndex: 'lastVisitTime',
      key: 'lastVisitTime',
      width: 160,
    },
    {
      title: '访问轨迹',
      key: 'tracking',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Visitor) => (
        <Button type="link" onClick={() => openTrackingDetail(record)}>
          查看明细
        </Button>
      ),
    },
  ]

  // 转换统计数据为图表格式
  const deviceData = statistics?.visitorsByDevice
    ? Object.entries(statistics.visitorsByDevice).map(([name, value]) => ({ name, value }))
    : []

  const browserData = statistics?.visitorsByBrowser
    ? Object.entries(statistics.visitorsByBrowser).map(([name, value]) => ({ name, value }))
    : []

  const osData = statistics?.visitorsByOs
    ? Object.entries(statistics.visitorsByOs).map(([name, value]) => ({ name, value }))
    : []

  const countryData = statistics?.visitorsByCountry
    ? Object.entries(statistics.visitorsByCountry).map(([name, value]) => ({ name, value }))
    : []
  const trafficSourceData = trafficSources.map((item) => ({
    name: item.source,
    value: item.sessions || 0,
  }))

  const firstSession = trackingDetail?.firstSession
  const selectedSessionKey = currentVisitor && selectedSession
    ? buildSessionKey(currentVisitor.id, selectedSession.sessionId)
    : null
  const selectedPages = selectedSessionKey ? sessionPagesMap[selectedSessionKey] || [] : []

  return (
    <div className="page-container">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={statsLoading}>
            <Statistic
              title="新增访客数"
              value={statistics?.totalVisitors || 0}
              prefix={<UserOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={statsLoading}>
            <Statistic
              title="PV"
              value={statistics?.totalPageViews || 0}
              prefix={<EyeOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={statsLoading}>
            <Statistic
              title="UV"
              value={statistics?.uniqueVisitors || 0}
              prefix={<GlobalOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={statsLoading}>
            <Statistic
              title="设备类型"
              value={Object.keys(statistics?.visitorsByDevice || {}).length}
              prefix={<DesktopOutlined className="text-orange-500" />}
              suffix="种"
            />
          </Card>
        </Col>
      </Row>

      <Card className="mb-4" size="small" title="统计时间范围">
        <Space>
          <RangePicker
            showTime
            onChange={(values) => {
              const start = values?.[0]?.format('YYYY-MM-DDTHH:mm:ss') || null
              const end = values?.[1]?.format('YYYY-MM-DDTHH:mm:ss') || null
              setStatRange([start, end])
            }}
          />
        </Space>
      </Card>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="设备分布" className="chart-card" loading={statsLoading} extra={<DesktopOutlined />}>
            <PieChart data={deviceData} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="浏览器分布" className="chart-card" loading={statsLoading} extra={<ChromeOutlined />}>
            <BarChart data={browserData} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="操作系统分布" className="chart-card" loading={statsLoading}>
            <PieChart data={osData} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="来源分布（按会话）" className="chart-card" loading={trafficSourcesLoading}>
            <PieChart data={trafficSourceData} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card title="国家/地区分布" className="chart-card" loading={statsLoading} extra={<ApartmentOutlined />}>
            <BarChart data={countryData} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card
            title="Top 落地页"
            className="chart-card"
            loading={landingPagesLoading}
            extra={
              <Space wrap>
                <Select
                  value={landingPageSource}
                  style={{ width: 120 }}
                  onChange={(value) => setLandingPageSource(value)}
                  options={[
                    { label: '全部来源', value: 'ALL' },
                    { label: '直接访问', value: 'DIRECT' },
                    { label: '搜索引擎', value: 'SEARCH' },
                    { label: '外部链接', value: 'REFERRAL' },
                    { label: 'UTM投放', value: 'UTM' },
                  ]}
                />
                <Select
                  value={landingPageOrderBy}
                  style={{ width: 110 }}
                  onChange={(value) => setLandingPageOrderBy(value)}
                  options={[
                    { label: '按会话', value: 'sessions' },
                    { label: '按UV', value: 'uv' },
                  ]}
                />
              </Space>
            }
          >
            <Table
              size="small"
              rowKey="pageKey"
              pagination={false}
              dataSource={topLandingPages}
              columns={[
                {
                  title: '落地页',
                  dataIndex: 'pageKey',
                  render: (_: string, record: LandingPageItem) => (
                    <Space direction="vertical" size={2}>
                      {renderPageKey(record.pageKey)}
                      <Tooltip title={record.landingPageUrl || record.pageKey}>
                        <span className="text-xs text-gray-400">{getDisplayUrl(record.landingPageUrl, record.pageKey)}</span>
                      </Tooltip>
                    </Space>
                  ),
                },
                { title: '会话', dataIndex: 'sessions', width: 90 },
                { title: 'UV', dataIndex: 'uv', width: 90 },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* 访客列表 */}
      <Card
        title="访客列表"
        className="chart-card"
        extra={
          <Space wrap>
            <Input
              placeholder="国家"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              style={{ width: 100 }}
              allowClear
            />
            <Input
              placeholder="省份"
              value={filters.province}
              onChange={(e) => setFilters({ ...filters, province: e.target.value })}
              style={{ width: 100 }}
              allowClear
            />
            <Input
              placeholder="城市"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              style={{ width: 100 }}
              allowClear
            />
            <Select
              placeholder="设备类型"
              value={filters.deviceType}
              onChange={(value) => setFilters({ ...filters, deviceType: value })}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="Desktop">桌面</Select.Option>
              <Select.Option value="Mobile">移动</Select.Option>
              <Select.Option value="Tablet">平板</Select.Option>
            </Select>
            <Input
              placeholder="操作系统"
              value={filters.osName}
              onChange={(e) => setFilters({ ...filters, osName: e.target.value })}
              style={{ width: 120 }}
              allowClear
            />
            <Input
              placeholder="浏览器"
              value={filters.browserName}
              onChange={(e) => setFilters({ ...filters, browserName: e.target.value })}
              style={{ width: 120 }}
              allowClear
            />
            <Select
              placeholder="来源"
              value={filters.trafficSource}
              onChange={(value) => setFilters({ ...filters, trafficSource: value })}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="DIRECT">直接访问</Select.Option>
              <Select.Option value="SEARCH">搜索引擎</Select.Option>
              <Select.Option value="REFERRAL">外部链接</Select.Option>
              <Select.Option value="UTM">UTM投放</Select.Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={visitors}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1320 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 位访客`,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
        />
      </Card>

      <Drawer
        title="访客访问轨迹"
        placement="right"
        width={760}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {currentVisitor && (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="访客标识">{currentVisitor.visitorUuid}</Descriptions.Item>
              <Descriptions.Item label="当前来源">
                <Space size={4} direction="vertical">
                  <Tag color={getTrafficSourceColor(currentVisitor.trafficSource)} style={{ width: 'fit-content' }}>
                    {currentVisitor.trafficSource || 'UNKNOWN'}
                  </Tag>
                  {renderUrlBlock(currentVisitor.refererUrl)}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="搜索引擎/关键词">
                {[currentVisitor.searchEngine, currentVisitor.searchKeywords].filter(Boolean).join(' / ') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="UTM">
                {[currentVisitor.utmSource, currentVisitor.utmMedium, currentVisitor.utmCampaign].filter(Boolean).join(' / ') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="首访时间">{currentVisitor.firstVisitTime || '-'}</Descriptions.Item>
              <Descriptions.Item label="最后访问">{currentVisitor.lastVisitTime || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">首访会话</Divider>

            {detailLoading ? (
              <div className="py-8 text-center text-gray-500">加载中...</div>
            ) : firstSession ? (
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="首访来源">{renderUrlBlock(firstSession.entryReferer)}</Descriptions.Item>
                <Descriptions.Item label="首访落地页">
                  {renderUrlBlock(firstSession.landingPageUrl, firstSession.entryPageKey || '-')}
                </Descriptions.Item>
                <Descriptions.Item label="首访时间">{firstSession.startedAt || '-'}</Descriptions.Item>
                <Descriptions.Item label="会话页数">{firstSession.pageCount || 0}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="暂无会话数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <Divider orientation="left">最近会话</Divider>

            {detailLoading ? (
              <div className="py-8 text-center text-gray-500">加载中...</div>
            ) : trackingDetail?.latestSessions?.length ? (
              <Table
                size="small"
                rowKey={(record: VisitorSessionTrace) => record.sessionId}
                dataSource={trackingDetail.latestSessions}
                pagination={false}
                scroll={{ x: 680 }}
                columns={[
                  {
                    title: '开始时间',
                    dataIndex: 'startedAt',
                    key: 'startedAt',
                    width: 160,
                  },
                  {
                    title: '落地页',
                    key: 'landingPageUrl',
                    width: 220,
                    render: (_: any, record: VisitorSessionTrace) => (
                      <Tooltip title={record.landingPageUrl || record.entryPageKey}>
                        <div className="max-w-[220px] truncate">
                          {getDisplayUrl(record.landingPageUrl, record.entryPageKey || '-')}
                        </div>
                      </Tooltip>
                    ),
                  },
                  {
                    title: '来源',
                    key: 'entryReferer',
                    width: 180,
                    render: (_: any, record: VisitorSessionTrace) => (
                      <Tooltip title={record.entryReferer}>
                        <div className="max-w-[180px] truncate">
                          {getDisplayUrl(record.entryReferer)}
                        </div>
                      </Tooltip>
                    ),
                  },
                  {
                    title: '页数',
                    dataIndex: 'pageCount',
                    key: 'pageCount',
                    width: 80,
                    render: (value: number) => value || 0,
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 100,
                    render: (_: any, record: VisitorSessionTrace) => (
                      <Button type={selectedSession?.sessionId === record.sessionId ? 'primary' : 'link'} onClick={() => loadSessionPages(currentVisitor.id, record)}>
                        查看路径
                      </Button>
                    ),
                  },
                ]}
              />
            ) : (
              <Empty description="暂无最近会话" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <Divider orientation="left">页面访问路径</Divider>

            {selectedSession ? (
              <>
                <Descriptions bordered column={1} size="small" className="mb-4">
                  <Descriptions.Item label="会话ID">{selectedSession.sessionId}</Descriptions.Item>
                  <Descriptions.Item label="会话来源">{renderUrlBlock(selectedSession.entryReferer)}</Descriptions.Item>
                  <Descriptions.Item label="落地页">
                    {renderUrlBlock(selectedSession.landingPageUrl, selectedSession.entryPageKey || '-')}
                  </Descriptions.Item>
                  <Descriptions.Item label="活跃区间">
                    {selectedSession.startedAt || '-'} 至 {selectedSession.lastActivityAt || '-'}
                  </Descriptions.Item>
                </Descriptions>

                {sessionPagesLoadingKey === selectedSessionKey ? (
                  <div className="py-8 text-center text-gray-500">加载路径中...</div>
                ) : selectedPages.length ? (
                  <List
                    size="small"
                    bordered
                    dataSource={selectedPages}
                    renderItem={(page: VisitorPageTrace, index: number) => (
                      <List.Item>
                        <div className="w-full">
                          <div className="flex items-center justify-between gap-4">
                            <Space align="start">
                              <Tag color="blue">{index + 1}</Tag>
                              <div>
                                <div className="font-medium">{getDisplayUrl(page.pageUrl, page.pageKey)}</div>
                                <div className="text-xs text-gray-400">{page.pageKey}</div>
                              </div>
                            </Space>
                            <div className="text-xs text-gray-400 whitespace-nowrap">{page.occurredAt}</div>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                            <LinkOutlined />
                            <span>来源：</span>
                            <span>{getDisplayUrl(page.referer)}</span>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="该会话暂无页面路径" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </>
            ) : (
              <Empty description="请选择一个会话查看路径" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default VisitorPage
