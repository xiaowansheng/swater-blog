import { useState, useEffect } from 'react'
import { Table } from 'antd'
import { getOperationLogList } from '@/api/log'
import { OperationLog } from '@/api/log'
import { formatDate } from '@/utils/format'

const LogOperationPage: React.FC = () => {
  const [logs, setLogs] = useState<OperationLog[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    loadLogs()
  }, [pagination.current, pagination.pageSize])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const result = await getOperationLogList({
        page: pagination.current,
        size: pagination.pageSize,
      })
      setLogs(result.records)
      setPagination({ ...pagination, total: result.total })
    } catch (error) {
      console.error('加载日志失败', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '操作', dataIndex: 'operation', key: 'operation' },
    { title: '方法', dataIndex: 'method', key: 'method' },
    { title: 'IP', dataIndex: 'ip', key: 'ip' },
    { title: '位置', dataIndex: 'location', key: 'location' },
    { title: '耗时(ms)', dataIndex: 'duration', key: 'duration' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', render: formatDate },
  ]

  return (
    <div>
      <Table
        columns={columns}
        dataSource={logs}
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

export default LogOperationPage

