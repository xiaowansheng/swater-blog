import { useState, useEffect } from 'react'
import { Table } from 'antd'
import { getErrorLogList } from '@/api/log'
import { ErrorLog } from '@/api/log'
import { formatDate } from '@/utils/format'

const LogErrorPage: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    loadLogs()
  }, [pagination.current, pagination.pageSize])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const result = await getErrorLogList({
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
    { title: '方法', dataIndex: 'method', key: 'method' },
    { title: 'URL', dataIndex: 'url', key: 'url' },
    { title: '错误', dataIndex: 'error', key: 'error' },
    { title: 'IP', dataIndex: 'ip', key: 'ip' },
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

export default LogErrorPage

