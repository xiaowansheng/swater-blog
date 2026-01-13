import { useState, useEffect } from 'react'
import { Table, Card, Row, Col, Statistic, Tag, DatePicker, Space, Tooltip } from 'antd'
import {
  UserOutlined,
  EyeOutlined,
  GlobalOutlined,
  DesktopOutlined,
  ApartmentOutlined,
  ChromeOutlined,
} from '@ant-design/icons'
import { getVisitorList, getVisitorStatistics } from '@/api/visitor'
import { Visitor, VisitorStatistics } from '@/types'
import PieChart from '@/components/Chart/PieChart'
import BarChart from '@/components/Chart/BarChart'

const { RangePicker } = DatePicker

const VisitorPage: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [statistics, setStatistics] = useState<VisitorStatistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [statRange, setStatRange] = useState<[string | null, string | null]>([null, null])

  useEffect(() => {
    loadVisitors()
    loadStatistics()
  }, [pagination.current, pagination.pageSize])

  useEffect(() => {
    loadStatistics()
  }, [statRange])

  const loadVisitors = async () => {
    setLoading(true)
    try {
      const result = await getVisitorList({
        page: pagination.current,
        size: pagination.pageSize,
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
          <Tag color="purple" style={{ marginBottom: 0 }}>{record.trafficSource || 'UNKNOWN'}</Tag>
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
              const start = values?.[0]?.toISOString() || null
              const end = values?.[1]?.toISOString() || null
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
          <Card title="国家/地区分布" className="chart-card" loading={statsLoading} extra={<ApartmentOutlined />}>
            <BarChart data={countryData} />
          </Card>
        </Col>
      </Row>

      {/* 访客列表 */}
      <Card title="访客列表" className="chart-card">
        <Table
          columns={columns}
          dataSource={visitors}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
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
    </div>
  )
}

export default VisitorPage
