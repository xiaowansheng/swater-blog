import { Card, Col, Row, Statistic } from 'antd'
import { UserOutlined, EyeOutlined, GlobalOutlined, DesktopOutlined } from '@ant-design/icons'
import { VisitorStatistics } from '@/types'

interface StatsCardsProps {
  statistics: VisitorStatistics | null
  loading: boolean
}

const StatsCards: React.FC<StatsCardsProps> = ({ statistics, loading }) => (
  <Row gutter={[16, 16]} className="mb-4">
    <Col xs={24} sm={12} lg={6}>
      <Card className="stat-card" loading={loading}>
        <Statistic
          title="新增访客数"
          value={statistics?.totalVisitors || 0}
          prefix={<UserOutlined className="text-blue-500" />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card className="stat-card" loading={loading}>
        <Statistic
          title="PV"
          value={statistics?.totalPageViews || 0}
          prefix={<EyeOutlined className="text-green-500" />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card className="stat-card" loading={loading}>
        <Statistic
          title="UV"
          value={statistics?.uniqueVisitors || 0}
          prefix={<GlobalOutlined className="text-purple-500" />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card className="stat-card" loading={loading}>
        <Statistic
          title="设备类型"
          value={Object.keys(statistics?.visitorsByDevice || {}).length}
          prefix={<DesktopOutlined className="text-orange-500" />}
          suffix="种"
        />
      </Card>
    </Col>
  </Row>
)

export default StatsCards
