import { useState, useEffect } from 'react'
import { Table, Tag, Input, Select, Button, DatePicker, Space } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { getOperationLogList } from '@/api/log'
import { LogOperation } from '@/types'

const { RangePicker } = DatePicker

const LogOperationPage: React.FC = () => {
  const [logs, setLogs] = useState<LogOperation[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState<{ module?: string; keyword?: string }>({})

  useEffect(() => {
    loadLogs()
  }, [pagination.current, pagination.pageSize])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const result = await getOperationLogList({
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

  const columns = [
    {
      title: '操作模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (module: string) => <Tag color="blue">{module}</Tag>,
    },
    {
      title: '操作描述',
      dataIndex: 'operation',
      key: 'operation',
      width: 150,
    },
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
      title: '操作人',
      dataIndex: 'username',
      key: 'username',
      width: 100,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (location: string) => location || '-',
    },
    {
      title: '耗时',
      dataIndex: 'executionTime',
      key: 'executionTime',
      width: 100,
      render: (time: number) => (
        <span className={time > 1000 ? 'text-red-500' : time > 500 ? 'text-orange-500' : 'text-green-500'}>
          {time}ms
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'error'}>
          {status === 1 ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
  ]

  return (
    <div className="page-container">
      <div className="search-bar">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="搜索操作描述"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="操作模块"
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
          scroll={{ x: 1400 }}
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
    </div>
  )
}

export default LogOperationPage
