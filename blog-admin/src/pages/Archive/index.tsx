import { useEffect, useState } from 'react'
import { Card, Timeline, Badge, Statistic, Row, Col, Empty } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { archiveApi } from '@/api/archive'
import { ArchiveVO } from '@/types'
import styles from './index.module.less'

interface GroupedArchive {
  year: number
  totalCount: number
  publishedCount: number
  draftCount: number
  privateCount: number
  months: ArchiveVO[]
}

const Archive: React.FC = () => {
  const [groupedArchives, setGroupedArchives] = useState<GroupedArchive[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchArchives()
  }, [])

  const fetchArchives = async () => {
    setLoading(true)
    try {
      const res = await archiveApi.getList()
      const archives = res.data || []
      groupArchivesByYear(archives)
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

    // 按年份倒序排序
    const sortedGroups = Object.values(grouped).sort((a, b) => b.year - a.year)

    // 每年内的月份按倒序排序
    sortedGroups.forEach((group) => {
      group.months.sort((a, b) => b.month - a.month)
    })

    setGroupedArchives(sortedGroups)
  }

  const formatMonth = (month: number) => {
    return month.toString().padStart(2, '0')
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
            <Statistic
              title="已发布"
              value={totalPublished}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="草稿"
              value={totalDraft}
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
        </Row>

        {groupedArchives.length === 0 ? (
          <Empty description="暂无归档数据" />
        ) : (
          <div className={styles.timelineContainer}>
            <Timeline mode="left" className={styles.timeline}>
              {groupedArchives.map((group) => (
                <Timeline.Item
                  key={group.year}
                  dot={<ClockCircleOutlined className={styles.timelineIcon} />}
                  label={
                    <div className={styles.yearLabel}>
                      <div className={styles.yearText}>{group.year}年</div>
                      <Badge
                        count={group.totalCount}
                        showZero
                        className={styles.yearBadge}
                      />
                    </div>
                  }
                >
                  <div className={styles.yearContent}>
                    <div className={styles.yearStats}>
                      <span className={styles.statItem}>
                        总计: <strong>{group.totalCount}</strong>
                      </span>
                      {group.publishedCount > 0 && (
                        <span className={styles.statItem}>
                          已发布: <strong className={styles.published}>{group.publishedCount}</strong>
                        </span>
                      )}
                      {group.draftCount > 0 && (
                        <span className={styles.statItem}>
                          草稿: <strong className={styles.draft}>{group.draftCount}</strong>
                        </span>
                      )}
                      {group.privateCount > 0 && (
                        <span className={styles.statItem}>
                          私密: <strong className={styles.private}>{group.privateCount}</strong>
                        </span>
                      )}
                    </div>
                    <div className={styles.monthsList}>
                      {group.months.map((month) => (
                        <div key={`${group.year}-${month.month}`} className={styles.monthItem}>
                          <span className={styles.monthLabel}>
                            {month.month}月
                          </span>
                          <Badge
                            count={month.postCount || 0}
                            showZero
                            className={styles.monthBadge}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Archive
