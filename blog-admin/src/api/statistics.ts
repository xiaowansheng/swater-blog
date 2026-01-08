import request from './request'
import { ArticleStatistics, VisitorStatistics, DashboardStatistics, TrendData, ChartData, Article, PageResult, Talk, Category, Tag, Comment } from '@/types'

export const getArticleStatistics = (): Promise<ArticleStatistics> => {
  return request.get('/admin/post/statistics')
}

export const getVisitorStatistics = (params?: {
  startDate?: string
  endDate?: string
}): Promise<VisitorStatistics> => {
  return request.get('/admin/visitor/statistics', { params })
}

export const getArticleList = (params: { page?: number; size?: number }): Promise<PageResult<Article>> => {
  return request.get('/admin/post/list', { params })
}

export const getTalkList = (params: { page?: number; size?: number }): Promise<PageResult<Talk>> => {
  return request.get('/admin/moment/list', { params })
}

export const getCategoryList = (): Promise<Category[]> => {
  return request.get('/admin/category/list')
}

export const getTagList = (): Promise<Tag[]> => {
  return request.get('/admin/tag/list')
}

export const getRecentComments = (params: { page?: number; size?: number }): Promise<PageResult<Comment>> => {
  return request.get('/admin/comment/list', { params })
}

export const getDashboardStatistics = async (): Promise<DashboardStatistics> => {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [
      articleStats,
      visitorStats,
      categories,
      tags,
      articlesResp,
      talksResp,
      todayVisitorStats,
    ] = await Promise.all([
      getArticleStatistics(),
      getVisitorStatistics(),
      getCategoryList(),
      getTagList(),
      getArticleList({ page: 1, size: 200 }),
      getTalkList({ page: 1, size: 200 }),
      getVisitorStatistics({ startDate: todayStart.toISOString(), endDate: todayEnd.toISOString() }),
    ])

    const articles = articlesResp.records || []
    const talks = talksResp.records || []

    const topViewedArticles: ChartData[] = [...articles]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10)
      .map((a) => ({ name: a.title, value: a.viewCount || 0 }))

    const topLikedArticles: ChartData[] = [...articles]
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, 10)
      .map((a) => ({ name: a.title, value: a.likeCount || 0 }))

    const recentMonthArticleTrend = buildMonthlyTrend(articles.map((a) => a.publishedAt || a.createTime))
    const recentMonthTalkTrend = buildMonthlyTrend(talks.map((t) => t.createTime))

    const visitTrend = buildVisitTrend(visitorStats.visitorsByDate || {})
    const visitorTrend = buildVisitTrend(visitorStats.visitorsByDate || {})

    return {
      articleCount: articleStats.totalCount,
      categoryCount: categories.length,
      tagCount: tags.length,
      totalVisitCount: visitorStats.totalPageViews,
      totalVisitorCount: visitorStats.totalVisitors,
      commentCount: articleStats.totalCommentCount,
      todayVisit: todayVisitorStats.totalPageViews,
      todayVisitor: todayVisitorStats.uniqueVisitors,
      articleTrend: recentMonthArticleTrend,
      talkTrend: recentMonthTalkTrend,
      visitTrend,
      visitorTrend,
      topViewedArticles,
      topLikedArticles,
      categoryDistribution: [],
      tagStatistics: [],
      recentArticles: articles.slice(0, 5),
      recentComments: [],
    }
  } catch (error) {
    console.error('获取仪表盘数据失败', error)
    return {
      articleCount: 0,
      categoryCount: 0,
      tagCount: 0,
      totalVisitCount: 0,
      totalVisitorCount: 0,
      commentCount: 0,
      todayVisit: 0,
      todayVisitor: 0,
      articleTrend: [],
      talkTrend: [],
      visitTrend: [],
      topViewedArticles: [],
      topLikedArticles: [],
      categoryDistribution: [],
      tagStatistics: [],
      recentArticles: [],
      recentComments: [],
    }
  }
}

function buildMonthlyTrend(dates: (string | undefined)[]): TrendData[] {
  const dayKeys = generateLastNDays(30)
  const buckets: Record<string, number> = {}
  dates
    .filter(Boolean)
    .map((d) => new Date(d as string))
    .forEach((date) => {
      const key = date.toISOString().split('T')[0]
      if (dayKeys.includes(key)) {
        buckets[key] = (buckets[key] || 0) + 1
      }
    })
  return dayKeys.map((date) => ({ date, value: buckets[date] || 0 }))
}

function buildVisitTrend(visitorsByDate: Record<string, number>): TrendData[] {
  const dayKeys = generateLastNDays(30)
  return dayKeys.map((date) => ({
    date,
    value: visitorsByDate[date] || 0,
  }))
}

function generateLastNDays(days: number): string[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const result: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    result.push(d.toISOString().split('T')[0])
  }
  return result
}
