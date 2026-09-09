import { Button, Descriptions, Divider, Drawer, Empty, Space, Table, Tag, Tooltip } from 'antd'
import { Visitor, VisitorPageTrace, VisitorSessionTrace, VisitorTrackingDetail } from '@/types'
import { buildSessionKey, getDisplayUrl, getTrafficSourceColor, renderUrlBlock } from './shared'
import SessionTrace from './SessionTrace'

interface VisitorDetailDrawerProps {
  open: boolean
  onClose: () => void
  visitor: Visitor | null
  loading: boolean
  detail: VisitorTrackingDetail | null
  selectedSession: VisitorSessionTrace | null
  sessionPagesMap: Record<string, VisitorPageTrace[]>
  sessionPagesLoadingKey: string | null
  onLoadSessionPages: (visitorId: number, session: VisitorSessionTrace) => void
}

const VisitorDetailDrawer: React.FC<VisitorDetailDrawerProps> = (props) => {
  const {
    open,
    onClose,
    visitor,
    loading,
    detail,
    selectedSession,
    sessionPagesMap,
    sessionPagesLoadingKey,
    onLoadSessionPages,
  } = props

  const firstSession = detail?.firstSession
  const selectedSessionKey = visitor && selectedSession
    ? buildSessionKey(visitor.id, selectedSession.sessionId)
    : null
  const selectedPages = selectedSessionKey ? sessionPagesMap[selectedSessionKey] || [] : []

  return (
    <Drawer
      title="访客访问轨迹"
      placement="right"
      width={760}
      open={open}
      onClose={onClose}
    >
      {visitor && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="访客标识">{visitor.visitorUuid}</Descriptions.Item>
            <Descriptions.Item label="最近入口来源">
              <Space size={4} direction="vertical">
                <Tag color={getTrafficSourceColor(visitor.trafficSource)} style={{ width: 'fit-content' }}>
                  {visitor.trafficSource || 'UNKNOWN'}
                </Tag>
                {renderUrlBlock(visitor.refererUrl)}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="搜索引擎/关键词">
              {[visitor.searchEngine, visitor.searchKeywords].filter(Boolean).join(' / ') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="UTM">
              {[visitor.utmSource, visitor.utmMedium, visitor.utmCampaign].filter(Boolean).join(' / ') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="首访时间">{visitor.firstVisitTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="最后访问">{visitor.lastVisitTime || '-'}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">首访会话</Divider>

          {loading ? (
            <div className="py-8 text-center text-gray-500">加载中...</div>
          ) : firstSession ? (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="首访来源">{renderUrlBlock(firstSession.entryReferer)}</Descriptions.Item>
              <Descriptions.Item label="首访落地页">
                {renderUrlBlock(firstSession.landingPageUrl, firstSession.entryPageKey || '-')}
              </Descriptions.Item>
              <Descriptions.Item label="首访时间">{firstSession.startedAt || '-'}</Descriptions.Item>
              <Descriptions.Item label="会话页数">{firstSession.pageCount || 0}</Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty description="暂无会话数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}

          <Divider orientation="left">最近会话</Divider>

          {loading ? (
            <div className="py-8 text-center text-gray-500">加载中...</div>
          ) : detail?.latestSessions?.length ? (
            <Table
              size="small"
              rowKey={(record: VisitorSessionTrace) => record.sessionId}
              dataSource={detail.latestSessions}
              pagination={false}
              scroll={{ x: 680 }}
              columns={[
                {
                  title: '开始时间',
                  dataIndex: 'startedAt',
                  key: 'startedAt',
                  width: 160,
                },
                {
                  title: '落地页',
                  key: 'landingPageUrl',
                  width: 220,
                  render: (_: unknown, record: VisitorSessionTrace) => (
                    <Tooltip title={record.landingPageUrl || record.entryPageKey}>
                      <div className="max-w-[220px] truncate">
                        {getDisplayUrl(record.landingPageUrl, record.entryPageKey || '-')}
                      </div>
                    </Tooltip>
                  ),
                },
                {
                  title: '来源',
                  key: 'entryReferer',
                  width: 180,
                  render: (_: unknown, record: VisitorSessionTrace) => (
                    <Tooltip title={record.entryReferer}>
                      <div className="max-w-[180px] truncate">
                        {getDisplayUrl(record.entryReferer)}
                      </div>
                    </Tooltip>
                  ),
                },
                {
                  title: '页数',
                  dataIndex: 'pageCount',
                  key: 'pageCount',
                  width: 80,
                  render: (value: number) => value || 0,
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 100,
                  render: (_: unknown, record: VisitorSessionTrace) => (
                    <Button type={selectedSession?.sessionId === record.sessionId ? 'primary' : 'link'} onClick={() => onLoadSessionPages(visitor.id, record)}>
                      查看路径
                    </Button>
                  ),
                },
              ]}
            />
          ) : (
            <Empty description="暂无最近会话" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}

          <Divider orientation="left">页面访问路径</Divider>

          <SessionTrace
            selectedSession={selectedSession}
            pages={selectedPages}
            loading={sessionPagesLoadingKey === selectedSessionKey}
          />
        </div>
      )}
    </Drawer>
  )
}

export default VisitorDetailDrawer
