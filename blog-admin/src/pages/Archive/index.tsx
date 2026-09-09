import { useEffect, useState, useCallback } from 'react'
import { Card, Timeline, Badge, Statistic, Row, Col, Empty, Tag, Spin } from 'antd'
import { ClockCircleOutlined, EyeOutlined, MessageOutlined, CalendarOutlined } from '@ant-design/icons'
import { archiveApi } from '@/api/archive'
import { ArchiveVO, Article } from '@/types'
import { ArticleStatus } from '@/types/enums'

interface GroupedArchive {
  year: number
  totalCount: number
  publishedCount: number
  draftCount: number
  privateCount: number
  months: ArchiveVO[]
}

interface TimelineItem {
  type: 'group' | 'item'
  year?: number
  month?: number
  content?: React.ReactNode
  article?: Article
}

const Archive: React.FC = () => {
  const [groupedArchives, setGroupedArchives] = useState<GroupedArchive[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])

  const groupArchivesByYear = useCallback((archives: ArchiveVO[]) => {
    const grouped: Record<number, GroupedArchive> = {}

    archives.forEach((archive) => {
      if (!grouped[archive.year]) {
        grouped[archive.year] = {
          year: archive.year,
          totalCount: 0,
          publishedCount: 0,
          draftCount: 0,
          privateCount: 0,
          months: []
        }
      }

      grouped[archive.year].months.push(archive)
      grouped[archive.year].totalCount += archive.postCount || 0
      grouped[archive.year].publishedCount += archive.publishedCount || 0
      grouped[archive.year].draftCount += archive.draftCount || 0
      grouped[archive.year].privateCount += archive.privateCount || 0
    })

    const sortedGroups = Object.values(grouped).sort((a, b) => b.year - a.year)

    sortedGroups.forEach((group) => {
      group.months.sort((a, b) => b.month - a.month)
    })

    setGroupedArchives(sortedGroups)
  }, [])

  const buildTimeline = useCallback((archives: ArchiveVO[]) => {
    const items: TimelineItem[] = []

    archives
      .sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year
        return b.month - a.month
      })
      .forEach((archive) => {
        items.push({
          type: 'group',
          year: archive.year,
          month: archive.month,
          content: (
            // monthGroupHeader: display flex / align-items center / justify-content flex-end / gap 8px / flex-wrap wrap
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <span className="text-[16px] font-semibold text-[#1890ff]">{archive.year}年</span>
              <span className="text-[15px] font-medium text-[#333]">{archive.month}月</span>
              {/* monthGroupBadge: 覆盖 .ant-badge-count 背景/字号/内边距/高度/行高/最小宽度，需用任意变体穿透 antd 子元素 */}
              <Badge
                count={archive.postCount || 0}
                showZero
                className="[&_.ant-badge-count]:bg-[#1890ff] [&_.ant-badge-count]:text-[12px] [&_.ant-badge-count]:px-2 [&_.ant-badge-count]:h-5 [&_.ant-badge-count]:leading-5 [&_.ant-badge-count]:min-w-[24px]"
              />
            </div>
          )
        })
      })

    setTimelineItems(items)
  }, [])

  const fetchArchives = useCallback(async () => {
    setLoading(true)
    try {
      const res = await archiveApi.getList()
      const archives = res.data || []
      groupArchivesByYear(archives)
      buildTimeline(archives)
    } catch (error) {
      console.error('获取归档数据失败:', error)
    } finally {
      setLoading(false)
    }
  }, [groupArchivesByYear, buildTimeline])

  useEffect(() => {
    fetchArchives()
  }, [fetchArchives])

  const loadArticles = useCallback(async (year: number, month: number) => {
    setArticlesLoading(true)
    try {
      const res = await archiveApi.getArticlesByYearMonth(year, month, 1, 100)
      setArticles(res.data?.records || [])
    } catch (error) {
      console.error('获取文章列表失败:', error)
    } finally {
      setArticlesLoading(false)
    }
  }, [])

  const handleMonthClick = (year: number, month: number) => {
    if (selectedMonth?.year === year && selectedMonth?.month === month) {
      setSelectedMonth(null)
      setArticles([])
    } else {
      setSelectedMonth({ year, month })
      loadArticles(year, month)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '')
  }

  const totalCount = groupedArchives.reduce((sum, group) => sum + group.totalCount, 0)
  const totalPublished = groupedArchives.reduce((sum, group) => sum + group.publishedCount, 0)
  const totalDraft = groupedArchives.reduce((sum, group) => sum + group.draftCount, 0)

  return (
    <div className="p-0">
      <Card title="归档时间轴" bordered={false} loading={loading}>
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Statistic title="总年数" value={groupedArchives.length} suffix="年" />
          </Col>
          <Col span={6}>
            <Statistic title="总文章数" value={totalCount} />
          </Col>
          <Col span={6}>
            <Statistic title="已发布" value={totalPublished} valueStyle={{ color: '#3f8600' }} />
          </Col>
          <Col span={6}>
            <Statistic title="草稿" value={totalDraft} valueStyle={{ color: '#cf1322' }} />
          </Col>
        </Row>

        {groupedArchives.length === 0 ? (
          <Empty description="暂无归档数据" />
        ) : (
          <div className="py-5">
            {/* timeline: 通过任意变体覆盖 antd 时间轴 label/tail/head/content 的定位（等价于原 :global 嵌套选择器） */}
            <Timeline
              mode="left"
              className="[&_.ant-timeline-item-label]:w-[180px] [&_.ant-timeline-item-label]:text-right [&_.ant-timeline-item-label]:pr-4 [&_.ant-timeline-item-tail]:left-[180px] [&_.ant-timeline-item-head]:left-[180px] [&_.ant-timeline-item-content]:left-[210px]"
            >
              {timelineItems.map((item, index) =>
                item.type === 'group' ? (
                  <Timeline.Item
                    key={`group-${index}`}
                    dot={<ClockCircleOutlined className="text-[16px] text-[#1890ff]" />}
                    label={
                      // monthLabel: cursor/padding/圆角/过渡/背景/边框 + hover 高亮右移；transition 用任意属性精确还原 all 0.3s（默认 ease）
                      <div
                        className="cursor-pointer px-3 py-2 rounded-md bg-[#fafafa] border border-[#e8e8e8] border-solid [transition:all_0.3s] hover:bg-[#e6f7ff] hover:border-[#1890ff] hover:translate-x-1"
                        onClick={() => item.year && item.month && handleMonthClick(item.year, item.month)}
                      >
                        {item.content}
                      </div>
                    }
                  >
                    {selectedMonth?.year === item.year && selectedMonth?.month === item.month && (
                      <div className="mt-4 bg-[#fafafa] p-4 rounded-lg border-solid border-l-[3px] border-l-[#1890ff]">
                        {articlesLoading ? (
                          <div className="flex justify-center items-center py-10">
                            <Spin size="large" />
                          </div>
                        ) : articles.length > 0 ? (
                          articles.map((article) => (
                            // articleItem: 卡片背景/边框/圆角/内边距/间距 + hover 边框高亮与阴影；preflight 关闭需显式 border-solid；last:mb-0 对应 &:last-child
                            <div
                              key={article.id}
                              className="bg-white border border-[#e8e8e8] border-solid rounded-md p-4 mb-3 [transition:all_0.3s] last:mb-0 hover:border-[#1890ff] hover:shadow-[0_2px_8px_rgba(24,144,255,0.15)]"
                            >
                              <div className="flex justify-between items-start mb-3 gap-4">
                                <h3 className="flex-1 m-0 text-[16px] font-semibold [&_a]:text-[#333] [&_a]:no-underline [&_a]:[transition:color_0.3s] [&_a:hover]:text-[#1890ff]">
                                  <a href={`/article/edit/${article.id}`} target="_blank" rel="noopener noreferrer">
                                    {article.title}
                                  </a>
                                </h3>
                                <div className="flex items-center gap-4 shrink-0">
                                  <span className="flex items-center gap-1 text-[13px] text-[#666]">
                                    <EyeOutlined />
                                    {article.viewCount || 0}
                                  </span>
                                  <span className="flex items-center gap-1 text-[13px] text-[#666]">
                                    <MessageOutlined />
                                    {article.commentCount || 0}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-3">
                                {article.categoryName && (
                                  <Tag color="blue">{article.categoryName}</Tag>
                                )}
                                {article.tags?.map((tag) => (
                                  <Tag key={tag.id} color="green">
                                    {tag.name}
                                  </Tag>
                                ))}
                                <Tag color={article.status === ArticleStatus.PUBLISHED ? 'green' : 'orange'}>
                                  {article.status === ArticleStatus.PUBLISHED ? '已发布' : '草稿'}
                                </Tag>
                              </div>

                              <div className="flex flex-wrap gap-4 mb-3 text-[13px] text-[#666]">
                                <span className="flex items-center gap-1">
                                  <CalendarOutlined />
                                  发布: {formatDate(article.publishedAt || article.createTime)}
                                </span>
                                {article.updateTime && article.updateTime !== article.createTime && (
                                  <span className="flex items-center gap-1">
                                    <CalendarOutlined />
                                    更新: {formatDate(article.updateTime)}
                                  </span>
                                )}
                              </div>

                              {article.content && (
                                <div className="text-[#666] text-[14px] leading-[1.6] p-3 bg-[#f5f5f5] rounded border-solid border-l-[3px] border-l-[#d9d9d9]">
                                  {truncateText(stripHtml(article.content), 150)}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <Empty description="该月份暂无文章" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                      </div>
                    )}
                  </Timeline.Item>
                ) : null
              )}
            </Timeline>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Archive
