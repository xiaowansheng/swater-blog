import { useState, useEffect, useCallback } from 'react'
import type { ColumnsType } from 'antd/es/table'
import { Table, Tag, Input, Button, Modal, Space, DatePicker, Select } from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import { getErrorLogList } from '@/api/log'
import { LogError } from '@/types'
import { formatDate } from '@/utils/format'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const LogErrorPage: React.FC = () => {
  const [logs, setLogs] = useState<LogError[]>([])
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const [searchForm, setSearchForm] = useState<{
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

  const [activeFilters, setActiveFilters] = useState<{
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

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getErrorLogList({
        page: current,
        size: pageSize,
        ...activeFilters,
      })
      setLogs(result.records)
      setTotal(result.total)
    } catch (error) {
      console.error('加载日志失败', error)
    } finally {
      setLoading(false)
    }
  }, [current, pageSize, activeFilters])

  const handleSearch = () => {
    setCurrent(1)
    setActiveFilters({ ...searchForm })
  }

  const handleReset = () => {
    setSearchForm({})
    setCurrent(1)
    setActiveFilters({})
  }

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const showDetail = (log: LogError) => {
    setSelectedLog(log)
    setDetailVisible(true)
  }

  const columns: ColumnsType<LogError> = [
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
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_, record) => (
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
            value={searchForm.keyword || ''}
            onChange={(e) => setSearchForm({ ...searchForm, keyword: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="模块"
            value={searchForm.module}
            onChange={(value) => setSearchForm({ ...searchForm, module: value })}
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
            value={searchForm.requestMethod}
            onChange={(value) => setSearchForm({ ...searchForm, requestMethod: value })}
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
            value={searchForm.requestUri || ''}
            onChange={(e) => setSearchForm({ ...searchForm, requestUri: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
            allowClear
          />
          <Input
            placeholder="错误名称"
            value={searchForm.errorName || ''}
            onChange={(e) => setSearchForm({ ...searchForm, errorName: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 180 }}
            allowClear
          />
          <Input
            placeholder="异常类型"
            value={searchForm.exceptionType || ''}
            onChange={(e) => setSearchForm({ ...searchForm, exceptionType: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 180 }}
            allowClear
          />
          <Input
            placeholder="操作人"
            value={searchForm.username || ''}
            onChange={(e) => setSearchForm({ ...searchForm, username: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 140 }}
            allowClear
          />
          <Input
            placeholder="用户ID"
            value={searchForm.userId ?? ''}
            onChange={(e) => setSearchForm({ ...searchForm, userId: e.target.value ? Number(e.target.value) : undefined })}
            onPressEnter={handleSearch}
            style={{ width: 120 }}
            type="number"
            allowClear
          />
          <Input
            placeholder="IP地址"
            value={searchForm.ip || ''}
            onChange={(e) => setSearchForm({ ...searchForm, ip: e.target.value })}
            onPressEnter={handleSearch}
            style={{ width: 140 }}
            allowClear
          />
          <RangePicker
            showTime
            value={searchForm.startDate && searchForm.endDate ? [dayjs(searchForm.startDate), dayjs(searchForm.endDate)] : undefined}
            onChange={(values) => {
              const startDate = values?.[0]?.toISOString()
              const endDate = values?.[1]?.toISOString()
              setSearchForm((prev) => ({ ...prev, startDate, endDate }))
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
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条记录`,
            onChange: (page, size) => {
              setCurrent(page)
              setPageSize(size)
            },
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
