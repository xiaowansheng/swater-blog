import { Card, Col, Row, Select, Space, Table, Tooltip } from 'antd'
import { LandingPageItem } from '@/types'
import { getDisplayUrl, renderPageKey } from './shared'

type LandingPageOrderBy = 'sessions' | 'uv'
type LandingPageSource = 'ALL' | 'DIRECT' | 'SEARCH' | 'REFERRAL' | 'UTM'

interface TopLandingPagesCardProps {
  loading: boolean
  dataSource: LandingPageItem[]
  orderBy: LandingPageOrderBy
  source: LandingPageSource
  onOrderByChange: (value: LandingPageOrderBy) => void
  onSourceChange: (value: LandingPageSource) => void
}

const TopLandingPagesCard: React.FC<TopLandingPagesCardProps> = ({ loading, dataSource, orderBy, source, onOrderByChange, onSourceChange }) => (
  <Row gutter={[16, 16]} className="mb-6">
    <Col xs={24}>
      <Card
        title="Top 落地页"
        className="chart-card"
        loading={loading}
        extra={
          <Space wrap>
            <Select
              value={source}
              style={{ width: 120 }}
              onChange={(value) => onSourceChange(value)}
              options={[
                { label: '全部来源', value: 'ALL' },
                { label: '直接访问', value: 'DIRECT' },
                { label: '搜索引擎', value: 'SEARCH' },
                { label: '外部链接', value: 'REFERRAL' },
                { label: 'UTM投放', value: 'UTM' },
              ]}
            />
            <Select
              value={orderBy}
              style={{ width: 110 }}
              onChange={(value) => onOrderByChange(value)}
              options={[
                { label: '按会话', value: 'sessions' },
                { label: '按UV', value: 'uv' },
              ]}
            />
          </Space>
        }
      >
        <Table
          size="small"
          rowKey="pageKey"
          pagination={false}
          dataSource={dataSource}
          columns={[
            {
              title: '落地页',
              dataIndex: 'pageKey',
              render: (_: string, record: LandingPageItem) => (
                <Space direction="vertical" size={2}>
                  {renderPageKey(record.pageKey)}
                  <Tooltip title={record.landingPageUrl || record.pageKey}>
                    <span className="text-xs text-gray-400">{getDisplayUrl(record.landingPageUrl, record.pageKey)}</span>
                  </Tooltip>
                </Space>
              ),
            },
            { title: '会话', dataIndex: 'sessions', width: 90 },
            { title: 'UV', dataIndex: 'uv', width: 90 },
          ]}
        />
      </Card>
    </Col>
  </Row>
)

export default TopLandingPagesCard
