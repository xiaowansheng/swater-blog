import { Card, Col, Row } from 'antd'
import { ApartmentOutlined, ChromeOutlined, DesktopOutlined } from '@ant-design/icons'
import { TrafficSourceItem, VisitorStatistics } from '@/types'
import PieChart from '@/components/Chart/PieChart'
import BarChart from '@/components/Chart/BarChart'

interface VisitorChartsProps {
  statistics: VisitorStatistics | null
  trafficSources: TrafficSourceItem[]
  statsLoading: boolean
  trafficSourcesLoading: boolean
}

const VisitorCharts: React.FC<VisitorChartsProps> = ({ statistics, trafficSources, statsLoading, trafficSourcesLoading }) => {
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

  return (
    <>
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
    </>
  )
}

export default VisitorCharts
