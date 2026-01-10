'use client'

import { useState, useEffect } from 'react'
import { articleApi } from '@/lib/api/article'
import type { PostVO } from '@/types'
import Link from 'next/link'

interface MonthGroup {
  year: number
  month: number
  articles: PostVO[]
}

interface YearGroup {
  year: number
  months: MonthGroup[]
}

const PAGE_SIZE = 20

export default function ArchiveTimeline() {
  const [allArticles, setAllArticles] = useState<PostVO[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [groupedData, setGroupedData] = useState<YearGroup[]>([])

  // 初始加载
  useEffect(() => {
    fetchArticles(1)
  }, [])

  // 分组文章数据
  useEffect(() => {
    if (allArticles.length > 0) {
      groupArticlesByDate(allArticles)
    }
  }, [allArticles])

  const fetchArticles = async (page: number, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const data = await articleApi.client.getList({
        page,
        size: PAGE_SIZE
      })

      const newArticles = data.records || []

      if (isLoadMore) {
        setAllArticles(prev => [...prev, ...newArticles])
      } else {
        setAllArticles(newArticles)
      }

      setHasMore(newArticles.length === PAGE_SIZE)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const groupArticlesByDate = (articles: PostVO[]) => {
    const yearMap = new Map<number, Map<number, PostVO[]>>()

    articles.forEach((article) => {
      const date = new Date(article.publishedAt || article.createTime)
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      if (!yearMap.has(year)) {
        yearMap.set(year, new Map())
      }

      const monthMap = yearMap.get(year)!
      if (!monthMap.has(month)) {
        monthMap.set(month, [])
      }

      monthMap.get(month)!.push(article)
    })

    const grouped: YearGroup[] = []

    // 按年份降序排序（最新的年份在前）
    Array.from(yearMap.entries())
      .sort(([a], [b]) => b - a)
      .forEach(([year, monthMap]) => {
        const months: MonthGroup[] = []

        // 按月份降序排序（最新的月份在前）
        Array.from(monthMap.entries())
          .sort(([a], [b]) => b - a)
          .forEach(([month, articles]) => {
            months.push({
              year,
              month,
              articles
            })
          })

        grouped.push({
          year,
          months
        })
      })

    setGroupedData(grouped)
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchArticles(currentPage + 1, true)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 150)
  }

  const totalPosts = allArticles.length
  const totalYears = groupedData.length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (totalPosts === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center text-muted">
        暂无文章
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">{totalYears}</div>
          <div className="text-muted text-sm">归档年数</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">{totalPosts}</div>
          <div className="text-muted text-sm">已加载文章</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {groupedData.reduce((sum, year) => sum + year.months.length, 0)}
          </div>
          <div className="text-muted text-sm">归档月数</div>
        </div>
      </div>

      {/* 时间轴 */}
      <div className="space-y-12">
        {groupedData.map((yearGroup) => (
          <div key={yearGroup.year} className="relative">
            {/* 年份节点 */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  📅
                </div>
                {/* 时间轴连接线 */}
                <div className="absolute top-16 left-1/2 w-0.5 h-8 bg-gradient-to-b from-primary/50 to-transparent -translate-x-1/2"></div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-primary">{yearGroup.year}年</h3>
                <p className="text-muted text-sm mt-1">
                  共 {yearGroup.months.reduce((sum, m) => sum + m.articles.length, 0)} 篇文章
                </p>
              </div>
            </div>

            {/* 月份列表 */}
            <div className="ml-8 pl-8 space-y-8 border-l-2 border-primary/20">
              {yearGroup.months.map((monthGroup) => (
                <div key={`${yearGroup.year}-${monthGroup.month}`} className="relative">
                  {/* 月份节点 */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="absolute -left-[41px] top-0 w-5 h-5 bg-primary rounded-full border-4 border-background shadow-md"></div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-primary mb-4">
                        {monthGroup.month}月
                        <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-sm">
                          {monthGroup.articles.length} 篇
                        </span>
                      </h4>

                      {/* 文章列表 */}
                      <div className="space-y-3 ml-2">
                        {monthGroup.articles.map((article, index) => (
                          <div
                            key={article.id}
                            className={`relative ${index < monthGroup.articles.length - 1 ? 'pb-4' : ''}`}
                          >
                            {/* 时间轴连接点 */}
                            <div className="absolute -left-6 top-3 w-2 h-2 bg-primary/50 rounded-full"></div>

                            {/* 文章卡片 */}
                            <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
                              <div className="space-y-3">
                                {/* 标题和日期 */}
                                <div className="flex items-start justify-between gap-4">
                                  <Link
                                    href={`/post/${article.articleKey || article.id}`}
                                    className="text-lg font-semibold hover:text-primary transition-colors flex-1 line-clamp-2"
                                  >
                                    {article.title}
                                  </Link>
                                  <span className="text-sm text-muted whitespace-nowrap flex items-center gap-1">
                                    📅 {formatDate(article.publishedAt || article.createTime)}
                                  </span>
                                </div>

                                {/* 分类和标签 */}
                                <div className="flex items-center gap-2 flex-wrap text-sm">
                                  {article.categoryName && (
                                    <Link
                                      href={`/category/${article.categoryKey || article.categoryId}`}
                                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1 text-xs"
                                    >
                                      📁 {article.categoryName}
                                    </Link>
                                  )}
                                  {article.tags && article.tags.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {article.tags.map((tag) => (
                                        <Link
                                          key={tag.id}
                                          href={`/tag/${tag.tagKey || tag.id}`}
                                          className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-xs"
                                        >
                                          🏷️ {tag.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* 摘要 */}
                                {article.content && (
                                  <p className="text-muted text-sm line-clamp-2">
                                    {stripHtml(article.content)}
                                  </p>
                                )}

                                {/* 统计信息 */}
                                <div className="flex items-center gap-4 text-xs text-muted">
                                  <span className="flex items-center gap-1">
                                    👁️ {article.viewCount || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    👍 {article.likeCount || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    💬 {article.commentCount || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                加载中...
              </>
            ) : (
              '加载更多'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
