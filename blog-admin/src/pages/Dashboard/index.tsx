import { useEffect, useState } from 'react'
import { Row, Col, Card, Spin, List, Avatar, Tag, Space, Typography, DatePicker, Radio, Table } from 'antd'
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
import { getDashboardStatistics, getStatisticsTopPages } from '@/api/statistics'
import { DashboardStatistics, TopPageItem } from '@/types'
import LineChart from '@/components/Chart/LineChart'
import BarChart from '@/components/Chart/BarChart'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

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
  const [topPages, setTopPages] = useState<TopPageItem[]>([])
  const [topPagesLoading, setTopPagesLoading] = useState(false)
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>(() => [
    dayjs().subtract(29, 'day'),
    dayjs(),
  ])
  const [topPagesOrderBy, setTopPagesOrderBy] = useState<'pv' | 'uv' | 'sessions'>('pv')

  useEffect(() => {
    loadStatistics()
  }, [range])

  useEffect(() => {
    loadTopPages()
  }, [topPagesOrderBy, range])

  const loadStatistics = async () => {
    setLoading(true)
    try {
      const start = range[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss')
      const end = range[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss')
      const data = await getDashboardStatistics({ start, end, topPagesOrderBy })
      setStatistics(data)
      setTopPages(data.topPages || [])
    } catch (error) {
      console.error('加载统计数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTopPages = async () => {
    setTopPagesLoading(true)
    try {
      const start = range[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss')
      const end = range[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss')
      const data = await getStatisticsTopPages({ start, end, limit: 10, orderBy: topPagesOrderBy })
      setTopPages(data || [])
    } catch (error) {
      console.error('加载 Top 页面失败', error)
    } finally {
      setTopPagesLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  const overview = statistics?.overview

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-6">
        <Title level={3} className="mb-0">仪表盘</Title>
      </div>

      {/* 内容区 */}
      <div className="mb-6">
        <Title level={4} className="mb-3">内容</Title>

        <Row gutter={[16, 16]} className="mb-4">
          {[
            {
              title: '文章总数',
              value: statistics?.articleCount || 0,
              icon: <FileTextOutlined />,
              color: '#1890ff',
            },
            {
              title: '说说总数',
              value: statistics?.talkCount || 0,
              icon: <CommentOutlined />,
              color: '#52c41a',
            },
            {
              title: '分类数',
              value: statistics?.categoryCount || 0,
              icon: <FolderOpenOutlined />,
              color: '#13c2c2',
            },
            {
              title: '标签数',
              value: statistics?.tagCount || 0,
              icon: <TagsOutlined />,
              color: '#722ed1',
            },
          ].map((item) => (
            <Col xs={24} sm={12} lg={6} key={item.title}>
              <StatCard {...item} />
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={24}>
            <Card title="最近一月发布趋势（文章 / 说说）" className="chart-card" variant="borderless">
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
                  <List.Item actions={[<Tag color="blue" key="view">浏览 {item.value}</Tag>]}>
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
                  <List.Item actions={[<Tag color="green" key="like">点赞 {item.value}</Tag>]}>
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

      {/* 数据区 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <Title level={4} className="mb-0">数据</Title>
          <Space>
            <RangePicker
              value={range}
              allowClear={false}
              onChange={(next) => {
                if (!next || !next[0] || !next[1]) return
                setRange([next[0], next[1]])
              }}
            />
          </Space>
        </div>

        <Row gutter={[16, 16]} className="mb-4">
          {[
            {
              title: '访问量（会话）',
              value: overview?.sessions || 0,
              icon: <RiseOutlined />,
              color: '#fa8c16',
            },
            {
              title: '访客数（UV）',
              value: overview?.uv || 0,
              icon: <TeamOutlined />,
              color: '#8c8c8c',
            },
            {
              title: '页面浏览量（PV）',
              value: overview?.pv || 0,
              icon: <EyeOutlined />,
              color: '#52c41a',
            },
            {
              title: '新访客',
              value: overview?.newUv || 0,
              icon: <TeamOutlined />,
              color: '#d46b08',
            },
          ].map((item) => (
            <Col xs={24} sm={12} lg={6} key={item.title}>
              <StatCard {...item} />
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} className="mb-4">
          {[
            {
              title: '人均页数',
              value: Number((overview?.pagesPerSession || 0).toFixed(2)),
              icon: <RiseOutlined />,
              color: '#722ed1',
            },
            {
              title: '阅读增量',
              value: overview?.totalReads || 0,
              icon: <FileTextOutlined />,
              color: '#1890ff',
            },
            {
              title: '点赞增量',
              value: overview?.totalLikes || 0,
              icon: <LikeOutlined />,
              color: '#eb2f96',
            },
            {
              title: '评论增量',
              value: overview?.totalComments || 0,
              icon: <CommentOutlined />,
              color: '#52c41a',
            },
          ].map((item) => (
            <Col xs={24} sm={12} lg={6} key={item.title}>
              <StatCard {...item} />
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={24}>
            <Card title="PV / UV / 会话趋势" className="chart-card" variant="borderless">
              <LineChart
                seriesList={[
                  { name: 'PV', data: statistics?.pvTrend || [], color: '#1890ff' },
                  { name: 'UV', data: statistics?.uvTrend || [], color: '#ff7875' },
                  { name: '会话', data: statistics?.sessionsTrend || [], color: '#52c41a' },
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} lg={24}>
            <Card title="阅读 / 点赞 / 评论增量趋势" className="chart-card" variant="borderless">
              <LineChart
                seriesList={[
                  { name: '阅读增量', data: statistics?.totalReadsTrend || [], color: '#1890ff' },
                  { name: '点赞增量', data: statistics?.totalLikesTrend || [], color: '#eb2f96' },
                  { name: '评论增量', data: statistics?.totalCommentsTrend || [], color: '#52c41a' },
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} lg={24}>
            <Card
              title="Top 页面"
              className="chart-card"
              variant="borderless"
              extra={
                <Radio.Group
                  value={topPagesOrderBy}
                  optionType="button"
                  buttonStyle="solid"
                  onChange={(e) => setTopPagesOrderBy(e.target.value)}
                  options={[
                    { label: '按 PV', value: 'pv' },
                    { label: '按 UV', value: 'uv' },
                    { label: '按 会话', value: 'sessions' },
                  ]}
                />
              }
            >
              <Table
                rowKey="pageKey"
                pagination={false}
                size="small"
                loading={topPagesLoading}
                dataSource={topPages}
                columns={[
                  {
                    title: '页面',
                    dataIndex: 'pageKey',
                    render: (pageKey: string) => {
                      const [type, ...rest] = String(pageKey || '').split(':')
                      const key = rest.join(':')
                      const tagColor = type === 'ARTICLE' ? 'blue' : type === 'TALK' ? 'gold' : 'default'
                      return (
                        <Space>
                          <Tag color={tagColor}>{type || 'PAGE'}</Tag>
                          <Text>{key || pageKey}</Text>
                        </Space>
                      )
                    },
                  },
                  { title: 'PV', dataIndex: 'pv', width: 120 },
                  { title: 'UV', dataIndex: 'uv', width: 120 },
                  { title: '会话', dataIndex: 'sessions', width: 120 },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>

    </div>
  )
}

export default Dashboard
