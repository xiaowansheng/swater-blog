import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic } from 'antd'
import { useWebSocket } from '@/hooks/useWebSocket'
import { getDashboardStatistics } from '@/api/statistics'
import LineChart from '@/components/Chart/LineChart'
import BarChart from '@/components/Chart/BarChart'
import PieChart from '@/components/Chart/PieChart'

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<any>({})
  useWebSocket()

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      const data = await getDashboardStatistics()
      setStatistics(data)
    } catch (error) {
      console.error('加载统计数据失败', error)
    }
  }

  return (
    <div>
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic title="文章总数" value={statistics.articleCount || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="评论总数" value={statistics.commentCount || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="访客总数" value={statistics.visitorCount || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日访问" value={statistics.todayVisit || 0} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="访问量趋势">
            <LineChart data={statistics.visitTrend || []} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="文章发布趋势">
            <BarChart data={statistics.articleTrend || []} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} className="mt-4">
        <Col span={12}>
          <Card title="分类文章分布">
            <PieChart data={statistics.categoryDistribution || []} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="标签使用统计">
            <BarChart data={statistics.tagStatistics || []} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard

