import { useState, useEffect } from 'react'
import { Table, Tag, Input, Button, Modal, Space } from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import { getErrorLogList } from '@/api/log'
import { LogError } from '@/types'
import { formatDate } from '@/utils/format'

const LogErrorPage: React.FC = () => {
  const [logs, setLogs] = useState<LogError[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState<{ keyword?: string }>({})
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedLog, setSelectedLog] = useState<LogError | null>(null)

  useEffect(() => {
    loadLogs()
  }, [pagination.current, pagination.pageSize])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const result = await getErrorLogList({
        page: pagination.current,
        size: pagination.pageSize,
        ...filters,
      })
      setLogs(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('加载日志失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    loadLogs()
  }

  const handleReset = () => {
    setFilters({})
    setPagination((prev) => ({ ...prev, current: 1 }))
    loadLogs()
  }

  const showDetail = (log: LogError) => {
    setSelectedLog(log)
    setDetailVisible(true)
  }

  const columns = [
    {
      title: '请求方法',
      dataIndex: 'requestMethod',
      key: 'requestMethod',
      width: 100,
      render: (method: string) => {
        const colorMap: Record<string, string> = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          DELETE: 'red',
        }
        return <Tag color={colorMap[method] || 'default'}>{method}</Tag>
      },
    },
    {
      title: '请求路径',
      dataIndex: 'requestUri',
      key: 'requestUri',
      ellipsis: true,
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      ellipsis: true,
      render: (msg: string) => (
        <span className="text-red-500">{msg}</span>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'username',
      key: 'username',
      width: 100,
      render: (name: string) => name || '-',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
    },
    {
      title: '发生时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: LogError) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="search-bar">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="搜索错误信息"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={{ width: 240 }}
            allowClear
          />
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
        />
      </div>

      {/* 详情弹窗 */}
      <Modal
        title="异常详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500 text-sm">请求方法</label>
                <p className="font-medium">{selectedLog.requestMethod}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">请求路径</label>
                <p className="font-medium break-all">{selectedLog.requestUri}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">操作人</label>
                <p className="font-medium">{selectedLog.username || '-'}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">IP地址</label>
                <p className="font-medium">{selectedLog.ip}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">发生时间</label>
                <p className="font-medium">{formatDate(selectedLog.createTime)}</p>
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-sm">请求参数</label>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-32">
                {selectedLog.requestParams || '无'}
              </pre>
            </div>
            <div>
              <label className="text-gray-500 text-sm">错误信息</label>
              <p className="text-red-500 font-medium">{selectedLog.errorMessage}</p>
            </div>
            <div>
              <label className="text-gray-500 text-sm">堆栈信息</label>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-64">
                {selectedLog.stackTrace || '无堆栈信息'}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default LogErrorPage
