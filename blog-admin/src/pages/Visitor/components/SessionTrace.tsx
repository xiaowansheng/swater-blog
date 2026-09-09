import { Descriptions, Empty, List, Space, Tag } from 'antd'
import { LinkOutlined } from '@ant-design/icons'
import { VisitorPageTrace, VisitorSessionTrace } from '@/types'
import { getDisplayUrl, renderUrlBlock } from './shared'

interface SessionTraceProps {
  selectedSession: VisitorSessionTrace | null
  pages: VisitorPageTrace[]
  loading: boolean
}

const SessionTrace: React.FC<SessionTraceProps> = ({ selectedSession, pages, loading }) => {
  if (!selectedSession) {
    return <Empty description="请选择一个会话查看路径" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <>
      <Descriptions bordered column={1} size="small" className="mb-4">
        <Descriptions.Item label="会话ID">{selectedSession.sessionId}</Descriptions.Item>
        <Descriptions.Item label="会话来源">{renderUrlBlock(selectedSession.entryReferer)}</Descriptions.Item>
        <Descriptions.Item label="落地页">
          {renderUrlBlock(selectedSession.landingPageUrl, selectedSession.entryPageKey || '-')}
        </Descriptions.Item>
        <Descriptions.Item label="活跃区间">
          {selectedSession.startedAt || '-'} 至 {selectedSession.lastActivityAt || '-'}
        </Descriptions.Item>
      </Descriptions>

      {loading ? (
        <div className="py-8 text-center text-gray-500">加载路径中...</div>
      ) : pages.length ? (
        <List
          size="small"
          bordered
          dataSource={pages}
          renderItem={(page: VisitorPageTrace, index: number) => (
            <List.Item>
              <div className="w-full">
                <div className="flex items-center justify-between gap-4">
                  <Space align="start">
                    <Tag color="blue">{index + 1}</Tag>
                    <div>
                      <div className="font-medium">{getDisplayUrl(page.pageUrl, page.pageKey)}</div>
                      <div className="text-xs text-gray-400">{page.pageKey}</div>
                    </div>
                  </Space>
                  <div className="text-xs text-gray-400 whitespace-nowrap">{page.occurredAt}</div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <LinkOutlined />
                  <span>来源：</span>
                  <span>{getDisplayUrl(page.referer)}</span>
                </div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="该会话暂无页面路径" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </>
  )
}

export default SessionTrace
