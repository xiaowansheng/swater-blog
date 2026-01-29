'use client'

import { useState, useEffect } from 'react'
import { articleApi } from '@/lib/api/article'
import type { PostVO } from '@/types'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { stripMarkdown } from '@/lib/utils/format'

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
  const t = useTranslations('common')
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

  // 去除 Markdown 和 HTML 标签的工具函数


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
        {t('noArticles')}
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 顶部统计区域 - 可选，目前注释掉 */}

      {/* 统一的时间轴容器 */}
      <div className="relative min-h-[500px]">
        {/* Global Continuous Rail */}
        {/* Mobile: left-6 (24px center) | Desktop: left-9 (36px center) */}
        {/* -ml-[1px] centers the 2px line exactly on the coordinate */}
        <div className="absolute left-6 md:left-9 top-0 bottom-0 w-0.5 -ml-[1px] bg-gradient-to-b from-primary via-accent to-transparent"></div>

        <div className="space-y-12">
          {groupedData.map((yearGroup) => (
            <div key={yearGroup.year} className="relative">
              {/* 年份头部 */}
              <div className="relative flex items-center mb-8">
                {/* 年份节点圆环 - 居中对齐线 */}
                <div className="absolute left-6 md:left-9 -translate-x-1/2 z-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg shadow-primary/30 relative overflow-hidden group hover:scale-110 transition-transform duration-300">
                    <span className="relative z-10">📅</span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  {/* 装饰星星 */}
                  <div className="absolute -top-1 -right-1 text-primary/40 text-xs animate-twinkle">✦</div>
                </div>

                {/* 年份标题内容 - padding避开节点 */}
                <div className="pl-16 md:pl-24 pt-1 md:pt-2">
                  <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {yearGroup.year}{t('year')}
                  </h3>
                  <p className="text-muted text-sm mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse"></span>
                    {t('totalArticlesInYear', { count: yearGroup.months.reduce((sum, m) => sum + m.articles.length, 0) })}
                  </p>
                </div>
              </div>

              {/* 月份分组列表 */}
              <div className="space-y-10">
                {yearGroup.months.map((monthGroup) => (
                  <div key={`${yearGroup.year}-${monthGroup.month}`} className="relative">
                    {/* 月份头部 */}
                    <div className="relative flex items-center mb-6">
                      {/* 月份节点点 - 居中对齐线 */}
                      <div className="absolute left-6 md:left-9 -translate-x-1/2 z-10">
                        <div className="w-5 h-5 bg-background border-4 border-primary rounded-full shadow-sm shadow-primary/20 group hover:scale-125 transition-transform duration-300"></div>
                      </div>

                      {/* 月份标题 - padding避开节点 */}
                      <div className="pl-16 md:pl-24">
                        <h4 className="text-xl md:text-3xl font-semibold bg-gradient-to-r from-primary/90 to-accent/90 bg-clip-text text-transparent flex items-center gap-3">
                          {monthGroup.month}{t('month')}
                          <span className="px-2 py-0.5 bg-primary/5 text-primary rounded-full text-xs border border-primary/10 font-normal">
                            {monthGroup.articles.length}
                          </span>
                        </h4>
                      </div>
                    </div>

                    {/* 文章列表 */}
                    <div className="space-y-5">
                      {monthGroup.articles.map((article) => (
                        <div key={article.id} className="relative group/article">
                          {/* 文章节点点 - 居中对齐线 */}
                          <div className="absolute left-6 md:left-9 top-6 -translate-x-1/2 z-10">
                            <div className="w-2.5 h-2.5 bg-gradient-to-r from-primary/40 to-accent/40 rounded-full group-hover/article:scale-150 group-hover/article:bg-primary transition-all duration-300"></div>
                          </div>

                          {/* 文章卡片 - padding避开节点 */}
                          <div className="pl-16 md:pl-24 pr-2">
                            <div className="bg-card border border-border/50 hover:border-primary/20 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden">
                              {/* 悬停光泽 */}
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] via-transparent to-accent/[0.01] opacity-0 group-hover/article:opacity-100 transition-opacity duration-300"></div>
                              
                              <div className="relative z-10 flex flex-col gap-3">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                  <Link
                                    href={`/post/${article.articleKey || article.id}`}
                                    className="text-lg font-bold text-foreground/90 hover:text-primary transition-colors line-clamp-2"
                                  >
                                    {article.title}
                                  </Link>
                                  <span className="text-xs text-muted/60 font-mono whitespace-nowrap bg-secondary/30 px-2 py-1 rounded">
                                    {formatDate(article.publishedAt || article.createTime)}
                                  </span>
                                </div>

                                {/* Content Preview */}
                                {article.content && (
                                  <p className="text-sm text-muted-foreground/80 line-clamp-2 font-normal leading-relaxed">
                                    {stripMarkdown(article.content).substring(0, 150)}
                                  </p>
                                )}

                                {/* Tags & Category */}
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  {article.categoryName && (
                                    <Link 
                                      href={`/category/${article.categoryKey || article.categoryId}`}
                                      className="px-2 py-0.5 rounded-md bg-blue-500/5 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                    >
                                      📁 {article.categoryName}
                                    </Link>
                                  )}
                                  {article.tags?.map(tag => (
                                    <Link
                                      key={tag.id}
                                      href={`/tag/${tag.tagKey || tag.id}`}
                                      className="px-2 py-0.5 rounded-md bg-green-500/5 text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
                                    >
                                      # {tag.name}
                                    </Link>
                                  ))}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-xs text-muted/50 pt-1 border-t border-border/30 mt-1">
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
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="flex justify-center pt-8 pb-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="group relative px-8 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full font-medium transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  {t('loading')}
                </>
              ) : (
                <>
                  <span>✨</span>
                  {t('loadMore')}
                </>
              )}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
