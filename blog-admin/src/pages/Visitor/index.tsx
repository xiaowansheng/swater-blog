import { useState, useEffect, useCallback } from 'react'
import { Table, Card, DatePicker, Space, Input, Select, Button } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { getVisitorList, getVisitorSessionPages, getVisitorStatistics, getVisitorTrackingDetail } from '@/api/visitor'
import { getStatisticsTopLandingPages, getStatisticsTrafficSources } from '@/api/statistics'
import { LandingPageItem, TrafficSourceItem, Visitor, VisitorPageTrace, VisitorSessionTrace, VisitorStatistics, VisitorTrackingDetail } from '@/types'
import StatsCards from './components/StatsCards'
import VisitorCharts from './components/VisitorCharts'
import TopLandingPagesCard from './components/TopLandingPagesCard'
import VisitorDetailDrawer from './components/VisitorDetailDrawer'
import { buildVisitorColumns } from './components/visitorColumns'
import { buildSessionKey, buildStatsRange } from './components/shared'

const { RangePicker } = DatePicker
const DEFAULT_SESSION_LIMIT = 20

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
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [statRange, setStatRange] = useState<[string | null, string | null]>([null, null])
  const [landingPageOrderBy, setLandingPageOrderBy] = useState<'sessions' | 'uv'>('sessions')
  const [landingPageSource, setLandingPageSource] = useState<'ALL' | 'DIRECT' | 'SEARCH' | 'REFERRAL' | 'UTM'>('ALL')

  const [searchForm, setSearchForm] = useState<{
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

  const [activeFilters, setActiveFilters] = useState<{
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

  const loadVisitors = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getVisitorList({
        page: current,
        size: pageSize,
        country: activeFilters.country || undefined,
        province: activeFilters.province || undefined,
        city: activeFilters.city || undefined,
        deviceType: activeFilters.deviceType || undefined,
        osName: activeFilters.osName || undefined,
        browserName: activeFilters.browserName || undefined,
        trafficSource: activeFilters.trafficSource || undefined,
      })
      setVisitors(result.records)
      setTotal(result.total)
    } catch (error) {
      console.error('加载访客列表失败', error)
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
      country: '',
      province: '',
      city: '',
      deviceType: undefined,
      osName: '',
      browserName: '',
      trafficSource: undefined,
    }
    setSearchForm(empty)
    setCurrent(1)
    setActiveFilters(empty)
  }

  const loadStatistics = useCallback(async () => {
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
  }, [statRange])

  const loadTrafficInsights = useCallback(async () => {
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
  }, [statRange, landingPageOrderBy, landingPageSource])

  useEffect(() => {
    loadVisitors()
  }, [loadVisitors])

  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])

  useEffect(() => {
    loadTrafficInsights()
  }, [loadTrafficInsights])

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

  const columns = buildVisitorColumns(openTrackingDetail)

  return (
    <div className="page-container">
      {/* 统计卡片 */}
      <StatsCards statistics={statistics} loading={statsLoading} />

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
      <VisitorCharts
        statistics={statistics}
        trafficSources={trafficSources}
        statsLoading={statsLoading}
        trafficSourcesLoading={trafficSourcesLoading}
      />

      <TopLandingPagesCard
        loading={landingPagesLoading}
        dataSource={topLandingPages}
        orderBy={landingPageOrderBy}
        source={landingPageSource}
        onOrderByChange={(value) => setLandingPageOrderBy(value)}
        onSourceChange={(value) => setLandingPageSource(value)}
      />

      {/* 访客列表 */}
      <Card
        title="访客列表"
        className="chart-card"
        extra={
          <Space wrap>
            <Input
              placeholder="国家"
              value={searchForm.country}
              onChange={(e) => setSearchForm({ ...searchForm, country: e.target.value })}
              onPressEnter={handleSearch}
              style={{ width: 100 }}
              allowClear
            />
            <Input
              placeholder="省份"
              value={searchForm.province}
              onChange={(e) => setSearchForm({ ...searchForm, province: e.target.value })}
              onPressEnter={handleSearch}
              style={{ width: 100 }}
              allowClear
            />
            <Input
              placeholder="城市"
              value={searchForm.city}
              onChange={(e) => setSearchForm({ ...searchForm, city: e.target.value })}
              onPressEnter={handleSearch}
              style={{ width: 100 }}
              allowClear
            />
            <Select
              placeholder="设备类型"
              value={searchForm.deviceType}
              onChange={(value) => setSearchForm({ ...searchForm, deviceType: value })}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="Desktop">桌面</Select.Option>
              <Select.Option value="Mobile">移动</Select.Option>
              <Select.Option value="Tablet">平板</Select.Option>
            </Select>
            <Input
              placeholder="操作系统"
              value={searchForm.osName}
              onChange={(e) => setSearchForm({ ...searchForm, osName: e.target.value })}
              onPressEnter={handleSearch}
              style={{ width: 120 }}
              allowClear
            />
            <Input
              placeholder="浏览器"
              value={searchForm.browserName}
              onChange={(e) => setSearchForm({ ...searchForm, browserName: e.target.value })}
              onPressEnter={handleSearch}
              style={{ width: 120 }}
              allowClear
            />
            <Select
              placeholder="来源"
              value={searchForm.trafficSource}
              onChange={(value) => setSearchForm({ ...searchForm, trafficSource: value })}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="DIRECT">直接访问</Select.Option>
              <Select.Option value="SEARCH">搜索引擎</Select.Option>
              <Select.Option value="REFERRAL">外部链接</Select.Option>
              <Select.Option value="UTM">UTM投放</Select.Option>
            </Select>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
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
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 位访客`,
            onChange: (page, size) => {
              setCurrent(page)
              setPageSize(size)
            },
          }}
        />
      </Card>

      <VisitorDetailDrawer
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        visitor={currentVisitor}
        loading={detailLoading}
        detail={trackingDetail}
        selectedSession={selectedSession}
        sessionPagesMap={sessionPagesMap}
        sessionPagesLoadingKey={sessionPagesLoadingKey}
        onLoadSessionPages={loadSessionPages}
      />
    </div>
  )
}

export default VisitorPage
