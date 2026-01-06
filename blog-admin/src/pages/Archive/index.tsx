import { useEffect, useState, useCallback } from 'react'
import { Card, Timeline, Badge, Statistic, Row, Col, Empty, Tag, Spin } from 'antd'
import { ClockCircleOutlined, EyeOutlined, MessageOutlined, CalendarOutlined } from '@ant-design/icons'
import { archiveApi } from '@/api/archive'
import { ArchiveVO, Article } from '@/types'
import styles from './index.module.less'

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

  useEffect(() => {
    fetchArchives()
  }, [])

  const fetchArchives = async () => {
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
  }

  const groupArchivesByYear = (archives: ArchiveVO[]) => {
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
  }

  const buildTimeline = (archives: ArchiveVO[]) => {
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
            <div className={styles.monthGroupHeader}>
              <span className={styles.yearText}>{archive.year}年</span>
              <span className={styles.monthText}>{archive.month}月</span>
              <Badge
                count={archive.postCount || 0}
                showZero
                className={styles.monthGroupBadge}
              />
            </div>
          )
        })
      })

    setTimelineItems(items)
  }

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
    <div className={styles.container}>
      <Card title="归档时间轴" bordered={false} loading={loading}>
        <Row gutter={16} className={styles.summaryRow}>
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
          <div className={styles.timelineContainer}>
            <Timeline mode="left" className={styles.timeline}>
              {timelineItems.map((item, index) =>
                item.type === 'group' ? (
                  <Timeline.Item
                    key={`group-${index}`}
                    dot={<ClockCircleOutlined className={styles.timelineIcon} />}
                    label={
                      <div
                        className={styles.monthLabel}
                        onClick={() => item.year && item.month && handleMonthClick(item.year, item.month)}
                      >
                        {item.content}
                      </div>
                    }
                  >
                    {selectedMonth?.year === item.year && selectedMonth?.month === item.month && (
                      <div className={styles.articlesList}>
                        {articlesLoading ? (
                          <div className={styles.loadingContainer}>
                            <Spin size="large" />
                          </div>
                        ) : articles.length > 0 ? (
                          articles.map((article) => (
                            <div key={article.id} className={styles.articleItem}>
                              <div className={styles.articleHeader}>
                                <h3 className={styles.articleTitle}>
                                  <a href={`/article/edit/${article.id}`} target="_blank" rel="noopener noreferrer">
                                    {article.title}
                                  </a>
                                </h3>
                                <div className={styles.articleMeta}>
                                  <span className={styles.metaItem}>
                                    <EyeOutlined />
                                    {article.viewCount || 0}
                                  </span>
                                  <span className={styles.metaItem}>
                                    <MessageOutlined />
                                    {article.commentCount || 0}
                                  </span>
                                </div>
                              </div>

                              <div className={styles.articleTags}>
                                {article.categoryName && (
                                  <Tag color="blue">{article.categoryName}</Tag>
                                )}
                                {article.tags?.map((tag) => (
                                  <Tag key={tag.id} color="green">
                                    {tag.name}
                                  </Tag>
                                ))}
                                <Tag color={article.status === 1 ? 'green' : 'orange'}>
                                  {article.status === 1 ? '已发布' : '草稿'}
                                </Tag>
                              </div>

                              <div className={styles.articleDates}>
                                <span className={styles.dateItem}>
                                  <CalendarOutlined />
                                  发布: {formatDate(article.publishedAt || article.createTime)}
                                </span>
                                {article.updateTime && article.updateTime !== article.createTime && (
                                  <span className={styles.dateItem}>
                                    <CalendarOutlined />
                                    更新: {formatDate(article.updateTime)}
                                  </span>
                                )}
                              </div>

                              {article.content && (
                                <div className={styles.articleContent}>
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
