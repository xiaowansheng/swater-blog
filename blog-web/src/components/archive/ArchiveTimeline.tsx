'use client'

import { useState, useEffect } from 'react'
import { archiveApi } from '@/lib/api/archive'
import type { ArchiveVO, PostVO } from '@/types'
import Link from 'next/link'

interface GroupedArchive {
  year: number
  months: ArchiveVO[]
}

export default function ArchiveTimeline() {
  const [archives, setArchives] = useState<ArchiveVO[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null)
  const [articles, setArticles] = useState<PostVO[]>([])
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [groupedArchives, setGroupedArchives] = useState<GroupedArchive[]>([])

  useEffect(() => {
    fetchArchives()
  }, [])

  const fetchArchives = async () => {
    try {
      const data = await archiveApi.getList()
      setArchives(data)
      groupArchivesByYear(data)
    } catch (error) {
      console.error('Failed to fetch archives:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupArchivesByYear = (archives: ArchiveVO[]) => {
    const grouped: Record<number, ArchiveVO[]> = {}

    archives.forEach((archive) => {
      if (!grouped[archive.year]) {
        grouped[archive.year] = []
      }
      grouped[archive.year].push(archive)
    })

    const sortedGroups = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a)
      .map((year) => ({
        year,
        months: grouped[year].sort((a, b) => b.month - a.month)
      }))

    setGroupedArchives(sortedGroups)
  }

  const handleMonthClick = async (year: number, month: number) => {
    if (selectedMonth?.year === year && selectedMonth?.month === month) {
      setSelectedMonth(null)
      setArticles([])
    } else {
      setSelectedMonth({ year, month })
      setArticlesLoading(true)
      try {
        const data = await archiveApi.getByYearMonth(year, month, 1, 100)
        setArticles(data.records || [])
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setArticlesLoading(false)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 150)
  }

  const totalPosts = archives.reduce((sum, archive) => sum + archive.postCount, 0)
  const totalYears = groupedArchives.length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
          <div className="text-muted text-sm">文章总数</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">{archives.length}</div>
          <div className="text-muted text-sm">归档月数</div>
        </div>
      </div>

      {/* 时间轴 */}
      <div className="space-y-8">
        {groupedArchives.map((group) => (
          <div key={group.year} className="relative">
            {/* 年份标题 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full text-3xl">
                📅
              </div>
              <div>
                <h3 className="text-3xl font-bold text-primary">{group.year}年</h3>
                <p className="text-muted text-sm mt-1">
                  共 {group.months.reduce((sum, m) => sum + m.postCount, 0)} 篇文章
                </p>
              </div>
            </div>

            {/* 月份列表 */}
            <div className="ml-20 space-y-3">
              {group.months.map((archive) => (
                <div key={`${archive.year}-${archive.month}`} className="space-y-3">
                  {/* 月份卡片 */}
                  <div
                    className={`bg-card border border-border rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 ${
                      selectedMonth?.year === archive.year && selectedMonth?.month === archive.month
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                    onClick={() => handleMonthClick(archive.year, archive.month)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📆</span>
                        <span className="text-lg font-semibold">
                          {archive.year}年 {archive.month}月
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {archive.postCount} 篇
                      </span>
                    </div>
                  </div>

                  {/* 文章列表（展开状态） */}
                  {selectedMonth?.year === archive.year && selectedMonth?.month === archive.month && (
                    <div className="ml-6 space-y-4">
                      {articlesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : articles.length > 0 ? (
                        articles.map((article) => (
                          <div
                            key={article.id}
                            className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
                          >
                            <div className="space-y-3">
                              {/* 标题 */}
                              <Link
                                href={`/post/${article.articleKey || article.id}`}
                                className="text-xl font-bold hover:text-primary transition-colors"
                              >
                                {article.title}
                              </Link>

                              {/* 分类和标签 */}
                              <div className="flex items-center gap-3 flex-wrap text-sm">
                                {article.categoryName && (
                                  <Link
                                    href={`/category/${article.categoryKey || article.categoryId}`}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1"
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
                                        className="px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                      >
                                        🏷️ {tag.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* 统计信息 */}
                              <div className="flex items-center gap-4 text-sm text-muted">
                                <span className="flex items-center gap-1">
                                  👁️ {article.viewCount || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  💬 {article.commentCount || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  📅 {formatDate(article.publishedAt || article.createTime)}
                                </span>
                              </div>

                              {/* 摘要 */}
                              {article.content && (
                                <p className="text-muted text-sm line-clamp-2">
                                  {stripHtml(article.content)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted">
                          该月份暂无文章
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
