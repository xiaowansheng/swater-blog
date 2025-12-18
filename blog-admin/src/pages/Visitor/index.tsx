import { useState, useEffect } from 'react'
import { Table } from 'antd'
import { getVisitorList } from '@/api/visitor'
import { Visitor } from '@/api/visitor'
import { formatDate } from '@/utils/format'

const VisitorPage: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    loadVisitors()
  }, [pagination.current, pagination.pageSize])

  const loadVisitors = async () => {
    setLoading(true)
    try {
      const result = await getVisitorList({
        page: pagination.current,
        size: pagination.pageSize,
      })
      setVisitors(result.records)
      setPagination({ ...pagination, total: result.total })
    } catch (error) {
      console.error('加载访客失败', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: 'IP', dataIndex: 'ip', key: 'ip' },
    { title: '位置', dataIndex: 'location', key: 'location' },
    { title: '设备', dataIndex: 'device', key: 'device' },
    { title: '浏览器', dataIndex: 'browser', key: 'browser' },
    { title: '访问时间', dataIndex: 'visitTime', key: 'visitTime', render: formatDate },
  ]

  return (
    <div>
      <Table
        columns={columns}
        dataSource={visitors}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
        }}
      />
    </div>
  )
}

export default VisitorPage

