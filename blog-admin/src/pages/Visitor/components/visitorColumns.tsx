import { Button, Space, Tag, Tooltip } from 'antd'
import { Visitor } from '@/types'
import { getTrafficSourceColor } from './shared'

export const buildVisitorColumns = (onOpenTrackingDetail: (visitor: Visitor) => void) => [
  {
    title: '访客标识',
    dataIndex: 'visitorUuid',
    key: 'visitorUuid',
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
    title: '地区/ISP',
    key: 'location',
    width: 200,
    render: (_: unknown, record: Visitor) => (
      <div>
        <div>{[record.country, record.province, record.city, record.district].filter(Boolean).join(' / ') || '-'}</div>
        <div className="text-xs text-gray-400">{record.isp || record.timezone || '-'}</div>
      </div>
    ),
  },
  {
    title: '设备',
    key: 'device',
    width: 180,
    render: (_: unknown, record: Visitor) => (
      <div>
        <div>{record.deviceType || '-'}</div>
        <div className="text-xs text-gray-400">
          {[record.deviceBrand, record.deviceModel].filter(Boolean).join(' ')}
        </div>
      </div>
    ),
  },
  {
    title: '操作系统',
    key: 'os',
    width: 160,
    render: (_: unknown, record: Visitor) => (
      <span>{[record.osName, record.osVersion].filter(Boolean).join(' ') || '-'}</span>
    ),
  },
  {
    title: '浏览器',
    key: 'browser',
    width: 160,
    render: (_: unknown, record: Visitor) => (
      <span>{[record.browserName, record.browserVersion].filter(Boolean).join(' ') || '-'}</span>
    ),
  },
  {
    title: '最近入口',
    key: 'trafficSource',
    width: 160,
    render: (_: unknown, record: Visitor) => (
      <Space size={4} direction="vertical">
        <Tag color={getTrafficSourceColor(record.trafficSource)} style={{ marginBottom: 0 }}>
          {record.trafficSource || 'UNKNOWN'}
        </Tag>
        {record.refererUrl && (
          <Tooltip title={record.refererUrl}>
            <div className="text-xs text-gray-400 truncate max-w-[140px]">{record.refererUrl}</div>
          </Tooltip>
        )}
        {(record.utmSource || record.utmMedium || record.utmCampaign) && (
          <div className="text-xs text-gray-400">
            {[record.utmSource, record.utmMedium, record.utmCampaign].filter(Boolean).join(' / ')}
          </div>
        )}
      </Space>
    ),
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
  {
    title: '访问轨迹',
    key: 'tracking',
    width: 120,
    fixed: 'right' as const,
    render: (_: unknown, record: Visitor) => (
      <Button type="link" onClick={() => onOpenTrackingDetail(record)}>
        查看明细
      </Button>
    ),
  },
]
