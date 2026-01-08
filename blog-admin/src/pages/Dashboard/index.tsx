import { useEffect, useState } from 'react'
import { Row, Col, Card, Spin, List, Avatar, Tag, Space, Typography } from 'antd'
import {
  FileTextOutlined,
  FolderOpenOutlined,
  TagsOutlined,
  CommentOutlined,
  EyeOutlined,
  RiseOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  LikeOutlined,
} from '@ant-design/icons'
import { getDashboardStatistics } from '@/api/statistics'
import { DashboardStatistics } from '@/types'
import LineChart from '@/components/Chart/LineChart'
import BarChart from '@/components/Chart/BarChart'
import dayjs from 'dayjs'

const { Title, Text } = Typography

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
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="分类数"
            value={statistics?.categoryCount || 0}
            icon={<FolderOpenOutlined />}
            color="#13c2c2"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="标签数"
            value={statistics?.tagCount || 0}
            icon={<TagsOutlined />}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总访问量"
            value={statistics?.totalVisitCount || 0}
            icon={<EyeOutlined />}
            color="#fa8c16"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总访客数"
            value={statistics?.totalVisitorCount || 0}
            icon={<TeamOutlined />}
            color="#8c8c8c"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="今日访问量"
            value={statistics?.todayVisit || 0}
            icon={<RiseOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="今日访客数"
            value={statistics?.todayVisitor || 0}
            icon={<TeamOutlined />}
            color="#d46b08"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="评论总数"
            value={statistics?.commentCount || 0}
            icon={<CommentOutlined />}
            color="#52c41a"
          />
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={24}>
          <Card title="访问量 / 访客趋势" className="chart-card" variant="borderless">
            <LineChart
              seriesList={[
                { name: '访问量', data: statistics?.visitTrend || [], color: '#1890ff' },
                { name: '访客数', data: statistics?.visitorTrend || [], color: '#ff7875' },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={24}>
          <Card title="最近一月文章/说说发布趋势" className="chart-card" variant="borderless">
            <BarChart
              seriesList={[
                { name: '文章', data: statistics?.articleTrend || [], color: '#1890ff' },
                { name: '说说', data: statistics?.talkTrend || [], color: '#faad14' },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={12}>
          <Card title="访问量 Top10 文章" className="chart-card" variant="borderless">
            <List
              dataSource={statistics?.topViewedArticles || []}
              renderItem={(item, index) => (
                <List.Item
                  actions={[<Tag color="blue" key="view">浏览 {item.value}</Tag>]}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{index + 1}</Avatar>}
                    title={<Text strong>{item.name}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="点赞 Top10 文章" className="chart-card" variant="borderless">
            <List
              dataSource={statistics?.topLikedArticles || []}
              renderItem={(item, index) => (
                <List.Item
                  actions={[<Tag color="green" key="like">点赞 {item.value}</Tag>]}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{index + 1}</Avatar>}
                    title={<Text strong>{item.name}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
