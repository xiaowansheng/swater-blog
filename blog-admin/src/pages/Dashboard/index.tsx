import { useEffect, useState } from 'react'
import { Row, Col, Card, Spin } from 'antd'
import {
  FileTextOutlined,
  CommentOutlined,
  EyeOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { getDashboardStatistics } from '@/api/statistics'
import { DashboardStatistics } from '@/types'
import LineChart from '@/components/Chart/LineChart'
import BarChart from '@/components/Chart/BarChart'
import PieChart from '@/components/Chart/PieChart'

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  trend?: number
  trendLabel?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, trendLabel }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between">
      <div>
        <p className="stat-label">{title}</p>
        <p className="stat-value">{value.toLocaleString()}</p>
        {trend !== undefined && (
          <div className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <span>{Math.abs(trend)}%</span>
            <span className="text-gray-400 ml-1">{trendLabel}</span>
          </div>
        )}
      </div>
      <div className="stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
    </div>
  </div>
)

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    setLoading(true)
    try {
      const data = await getDashboardStatistics()
      setStatistics(data)
    } catch (error) {
      console.error('加载统计数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="page-container fade-in">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="文章总数"
            value={statistics?.articleCount || 0}
            icon={<FileTextOutlined />}
            color="#1890ff"
            trend={12}
            trendLabel="较上周"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="评论总数"
            value={statistics?.commentCount || 0}
            icon={<CommentOutlined />}
            color="#52c41a"
            trend={8}
            trendLabel="较上周"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="访客总数"
            value={statistics?.visitorCount || 0}
            icon={<EyeOutlined />}
            color="#722ed1"
            trend={-3}
            trendLabel="较上周"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="今日访问"
            value={statistics?.todayVisit || 0}
            icon={<RiseOutlined />}
            color="#fa8c16"
            trend={25}
            trendLabel="较昨日"
          />
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="访问量趋势" className="chart-card" variant="borderless">
            <LineChart data={statistics?.visitTrend || []} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="文章发布趋势" className="chart-card" variant="borderless">
            <BarChart data={statistics?.articleTrend || []} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={12}>
          <Card title="设备分布" className="chart-card" variant="borderless">
            <PieChart data={statistics?.categoryDistribution || []} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="浏览器统计" className="chart-card" variant="borderless">
            <BarChart data={statistics?.tagStatistics || []} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
