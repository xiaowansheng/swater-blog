import { useState, useEffect } from 'react'
import { Table, Card, Row, Col, Statistic, Tag, DatePicker, Space, Spin } from 'antd'
import {
  UserOutlined,
  EyeOutlined,
  GlobalOutlined,
  DesktopOutlined,
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

  useEffect(() => {
    loadVisitors()
    loadStatistics()
  }, [pagination.current, pagination.pageSize])

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
      const data = await getVisitorStatistics()
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
      dataIndex: 'visitorKey',
      key: 'visitorKey',
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
      title: '地区',
      key: 'location',
      width: 180,
      render: (_: any, record: Visitor) => (
        <span>
          {[record.country, record.province, record.city].filter(Boolean).join(' ') || '-'}
        </span>
      ),
    },
    {
      title: '设备',
      key: 'device',
      width: 150,
      render: (_: any, record: Visitor) => (
        <div>
          <div>{record.deviceType || '-'}</div>
          <div className="text-xs text-gray-400">{record.os}</div>
        </div>
      ),
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 120,
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

  return (
    <div className="page-container">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="总访客数"
              value={statistics?.totalVisitors || 0}
              prefix={<UserOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="总浏览量"
              value={statistics?.totalPageViews || 0}
              prefix={<EyeOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="独立访客"
              value={statistics?.uniqueVisitors || 0}
              prefix={<GlobalOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="设备类型"
              value={Object.keys(statistics?.visitorsByDevice || {}).length}
              prefix={<DesktopOutlined className="text-orange-500" />}
              suffix="种"
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="设备分布" className="chart-card" loading={statsLoading}>
            <PieChart data={deviceData} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="浏览器分布" className="chart-card" loading={statsLoading}>
            <BarChart data={browserData} />
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
