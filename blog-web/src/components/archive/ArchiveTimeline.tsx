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
        <div className="group relative bg-card border border-border rounded-xl p-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent"></div>
          <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-lg"></div>
          <div className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">{totalYears}</div>
            <div className="text-muted text-sm">归档年数</div>
          </div>
        </div>
        <div className="group relative bg-card border border-border rounded-xl p-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] via-transparent to-transparent"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-lg"></div>
          <div className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">{totalPosts}</div>
            <div className="text-muted text-sm">已加载文章</div>
          </div>
        </div>
        <div className="group relative bg-card border border-border rounded-xl p-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02]"></div>
          <div className="absolute top-2 left-2 w-8 h-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-lg"></div>
          <div className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] group-hover:animate-gradient mb-2 group-hover:scale-110 transition-transform duration-300">
              {groupedData.reduce((sum, year) => sum + year.months.length, 0)}
            </div>
            <div className="text-muted text-sm">归档月数</div>
          </div>
        </div>
      </div>

      {/* 时间轴 */}
      <div className="space-y-12">
        {groupedData.map((yearGroup) => (
          <div key={yearGroup.year} className="relative group/year">
            {/* 年份节点 */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/30 group-hover/year:scale-110 transition-transform duration-300 relative overflow-hidden">
                  <span className="relative z-10">📅</span>
                  {/* 光泽效果 */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/year:opacity-100 transition-opacity duration-300"></div>
                </div>
                {/* 时间轴连接线 */}
                <div className="absolute top-16 left-1/2 w-0.5 h-8 bg-gradient-to-b from-primary/50 via-accent/50 to-transparent -translate-x-1/2"></div>
                {/* 装饰星星 */}
                <div className="absolute -top-2 -right-2 text-primary/40 text-xs animate-twinkle">✦</div>
              </div>
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{yearGroup.year}年</h3>
                <p className="text-muted text-sm mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse"></span>
                  共 {yearGroup.months.reduce((sum, m) => sum + m.articles.length, 0)} 篇文章
                </p>
              </div>
            </div>

            {/* 月份列表 */}
            <div className="ml-8 pl-8 space-y-8 border-l-2 border-gradient-to-b from-primary/30 via-accent/30 to-transparent">
              {yearGroup.months.map((monthGroup) => (
                <div key={`${yearGroup.year}-${monthGroup.month}`} className="relative group/month">
                  {/* 月份节点 */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="absolute -left-[41px] top-0 w-5 h-5 bg-gradient-to-br from-primary to-accent rounded-full border-4 border-background shadow-md shadow-primary/30 group-hover/month:scale-125 transition-transform duration-300 relative">
                      {/* 装饰光晕 */}
                      <div className="absolute inset-0 rounded-full bg-primary/30 blur-md opacity-0 group-hover/month:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                        {monthGroup.month}月
                        <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-full text-sm border border-primary/20">
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
                            <div className="absolute -left-6 top-3 w-2 h-2 bg-gradient-to-r from-primary/50 to-accent/50 rounded-full group-hover/month:scale-150 transition-transform duration-300"></div>

                            {/* 文章卡片 */}
                            <div className="group/article bg-card border border-border rounded-xl p-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                              {/* 悬停背景 */}
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover/article:opacity-100 transition-opacity duration-300"></div>

                              <div className="space-y-3 relative z-10">
                                {/* 标题和日期 */}
                                <div className="flex items-start justify-between gap-4">
                                  <Link
                                    href={`/post/${article.articleKey || article.id}`}
                                    className="text-lg font-semibold hover:text-primary transition-colors flex-1 line-clamp-2 group-hover/article:translate-x-1 transition-transform duration-300"
                                  >
                                    {article.title}
                                  </Link>
                                  <span className="text-sm text-muted whitespace-nowrap flex items-center gap-1 px-2 py-1 bg-secondary/30 rounded-md">
                                    <span>📅</span>
                                    {formatDate(article.publishedAt || article.createTime)}
                                  </span>
                                </div>

                                {/* 分类和标签 */}
                                <div className="flex items-center gap-2 flex-wrap text-sm">
                                  {article.categoryName && (
                                    <Link
                                      href={`/category/${article.categoryKey || article.categoryId}`}
                                      className="group/tag px-2 py-1 bg-gradient-to-r from-blue-100/50 to-blue-200/50 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 rounded-md hover:from-blue-200/70 dark:hover:from-blue-800/50 transition-all duration-300 flex items-center gap-1 text-xs border border-blue-200/50 dark:border-blue-700/50 hover:scale-105"
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
                                          className="group/tag px-2 py-1 bg-gradient-to-r from-green-100/50 to-green-200/50 dark:from-green-900/30 dark:to-green-800/30 text-green-700 dark:text-green-300 rounded-md hover:from-green-200/70 dark:hover:from-green-800/50 transition-all duration-300 text-xs border border-green-200/50 dark:border-green-700/50 hover:scale-105"
                                        >
                                          🏷️ {tag.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* 摘要 */}
                                {article.content && (
                                  <p className="text-muted text-sm line-clamp-2 px-3 py-2 bg-secondary/20 rounded-lg border border-primary/5">
                                    {stripHtml(article.content)}
                                  </p>
                                )}

                                {/* 统计信息 */}
                                <div className="flex items-center gap-4 text-xs text-muted">
                                  <span className="flex items-center gap-1 group/stat hover:text-foreground/80 transition-colors">
                                    <span className="group-hover/stat:scale-125 transition-transform duration-300">👁️</span>
                                    {article.viewCount || 0}
                                  </span>
                                  <span className="flex items-center gap-1 group/stat hover:text-foreground/80 transition-colors">
                                    <span className="group-hover/stat:scale-125 transition-transform duration-300">👍</span>
                                    {article.likeCount || 0}
                                  </span>
                                  <span className="flex items-center gap-1 group/stat hover:text-foreground/80 transition-colors">
                                    <span className="group-hover/stat:scale-125 transition-transform duration-300">💬</span>
                                    {article.commentCount || 0}
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
            className="group relative px-8 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 overflow-hidden"
          >
            {/* 按钮光泽效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center gap-2">
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  加载中...
                </>
              ) : (
                <>
                  <span>✨</span>
                  加载更多
                </>
              )}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
