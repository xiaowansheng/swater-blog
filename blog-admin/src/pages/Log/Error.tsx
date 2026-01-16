import { useState, useEffect } from 'react'
import { Table, Tag, Input, Button, Modal, Space, DatePicker, Select } from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import { getErrorLogList } from '@/api/log'
import { LogError } from '@/types'
import { formatDate } from '@/utils/format'

const { RangePicker } = DatePicker

const LogErrorPage: React.FC = () => {
  const [logs, setLogs] = useState<LogError[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState<{
    keyword?: string
    module?: string
    requestMethod?: string
    requestUri?: string
    username?: string
    userId?: number
    ip?: string
    errorName?: string
    exceptionType?: string
    startDate?: string
    endDate?: string
  }>({})
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
      title: '错误名',
      dataIndex: 'errorName',
      key: 'errorName',
      width: 150,
      ellipsis: true,
      render: (name: string) => (
        <span className="text-orange-500 font-medium">{name || '-'}</span>
      ),
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
      render: (name: string) => {
        if (name === 'visitor') {
          return <Tag color="default">访客</Tag>
        }
        return name || '-'
      },
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
      fixed: 'right',
      align: 'center',
      render: (_: any, record: LogError) => (
        <div style={{ textAlign: 'center' }}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            详情
          </Button>
        </div>
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
          <Select
            placeholder="模块"
            value={filters.module}
            onChange={(value) => setFilters({ ...filters, module: value })}
            style={{ width: 140 }}
            allowClear
          >
            <Select.Option value="文章">文章</Select.Option>
            <Select.Option value="用户">用户</Select.Option>
            <Select.Option value="评论">评论</Select.Option>
            <Select.Option value="系统">系统</Select.Option>
          </Select>
          <Select
            placeholder="请求方法"
            value={filters.requestMethod}
            onChange={(value) => setFilters({ ...filters, requestMethod: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value="GET">GET</Select.Option>
            <Select.Option value="POST">POST</Select.Option>
            <Select.Option value="PUT">PUT</Select.Option>
            <Select.Option value="DELETE">DELETE</Select.Option>
          </Select>
          <Input
            placeholder="请求路径"
            value={filters.requestUri}
            onChange={(e) => setFilters({ ...filters, requestUri: e.target.value })}
            style={{ width: 200 }}
            allowClear
          />
          <Input
            placeholder="错误名称"
            value={filters.errorName}
            onChange={(e) => setFilters({ ...filters, errorName: e.target.value })}
            style={{ width: 180 }}
            allowClear
          />
          <Input
            placeholder="异常类型"
            value={filters.exceptionType}
            onChange={(e) => setFilters({ ...filters, exceptionType: e.target.value })}
            style={{ width: 180 }}
            allowClear
          />
          <Input
            placeholder="操作人"
            value={filters.username}
            onChange={(e) => setFilters({ ...filters, username: e.target.value })}
            style={{ width: 140 }}
            allowClear
          />
          <Input
            placeholder="用户ID"
            value={filters.userId ?? ''}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value ? Number(e.target.value) : undefined })}
            style={{ width: 120 }}
            type="number"
            allowClear
          />
          <Input
            placeholder="IP地址"
            value={filters.ip}
            onChange={(e) => setFilters({ ...filters, ip: e.target.value })}
            style={{ width: 140 }}
            allowClear
          />
          <RangePicker
            showTime
            onChange={(values) => {
              const startDate = values?.[0]?.toISOString()
              const endDate = values?.[1]?.toISOString()
              setFilters((prev) => ({ ...prev, startDate, endDate }))
            }}
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
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500 text-sm">日志ID</label>
                <p className="font-medium">{selectedLog.id}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">请求模块</label>
                <p className="font-medium">{selectedLog.module || '-'}</p>
              </div>
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
                <p className="font-medium">
                  {selectedLog.username === 'visitor' ? '访客' : (selectedLog.username || '-')}
                </p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">用户ID</label>
                <p className="font-medium">{selectedLog.userId || '-'}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">IP地址</label>
                <p className="font-medium">{selectedLog.ip}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">IP归属地</label>
                <p className="font-medium">{selectedLog.ipSource || '-'}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">设备</label>
                <p className="font-medium">{selectedLog.device || '-'}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">浏览器</label>
                <p className="font-medium">{selectedLog.browser || '-'}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">版本</label>
                <p className="font-medium">{selectedLog.version || '-'}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">发生时间</label>
                <p className="font-medium">{formatDate(selectedLog.createTime)}</p>
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-sm">调用方法</label>
              <p className="font-medium break-all text-sm">{selectedLog.callingMethod || '-'}</p>
            </div>
            <div>
              <label className="text-gray-500 text-sm">异常类型</label>
              <p className="font-medium break-all text-sm">{selectedLog.exceptionType || '-'}</p>
            </div>
            <div>
              <label className="text-gray-500 text-sm">错误名</label>
              <p className="font-medium text-orange-500">{selectedLog.errorName || '-'}</p>
            </div>
            <div>
              <label className="text-gray-500 text-sm">请求参数</label>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-64">
                {selectedLog.requestParams
                  ? JSON.stringify(JSON.parse(selectedLog.requestParams), null, 2)
                  : '无'}
              </pre>
            </div>
            <div>
              <label className="text-gray-500 text-sm">异常信息</label>
              <p className="text-red-500 font-medium">{selectedLog.exceptionMsg || '-'}</p>
            </div>
            <div>
              <label className="text-gray-500 text-sm">错误信息</label>
              <p className="text-red-500 font-medium">{selectedLog.errorMessage}</p>
            </div>
            <div>
              <label className="text-gray-500 text-sm">堆栈信息</label>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-96">
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
