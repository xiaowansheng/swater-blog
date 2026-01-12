import request from './request'
import { ArticleStatistics, VisitorStatistics, DashboardStatistics, TrendData, ChartData, Article, PageResult, Talk, Category, Tag, Comment, StatisticsOverview, DailyTrendData, TopPageItem } from '@/types'
import dayjs from 'dayjs'

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

export const getDashboardStatistics = async (params?: {
  start?: string
  end?: string
  topPagesOrderBy?: 'pv' | 'uv' | 'sessions'
}): Promise<DashboardStatistics> => {
  try {
    const end = params?.end ? dayjs(params.end) : dayjs().endOf('day')
    const start = params?.start ? dayjs(params.start) : dayjs().subtract(29, 'day').startOf('day')
    const startStr = start.format('YYYY-MM-DDTHH:mm:ss')
    const endStr = end.format('YYYY-MM-DDTHH:mm:ss')
    const topPagesOrderBy = params?.topPagesOrderBy || 'pv'
    const dayKeys = generateDaysBetween(startStr, endStr)

    const [
      articleStats,
      categories,
      tags,
      articlesResp,
      talksResp,
      overview,
      pvTrendResp,
      uvTrendResp,
      sessionsTrendResp,
      newUvTrendResp,
      articleReadsTrendResp,
      talkReadsTrendResp,
      articleLikesTrendResp,
      talkLikesTrendResp,
      articleCommentsTrendResp,
      talkCommentsTrendResp,
      topPages,
    ] = await Promise.all([
      getArticleStatistics(),
      getCategoryList(),
      getTagList(),
      getArticleList({ page: 1, size: 200 }),
      getTalkList({ page: 1, size: 200 }),
      getStatisticsOverview({ start: startStr, end: endStr }),
      getStatisticsTrendDaily({ metric: 'pv', start: startStr, end: endStr }),
      getStatisticsTrendDaily({ metric: 'uv', start: startStr, end: endStr }),
      getStatisticsTrendDaily({ metric: 'sessions', start: startStr, end: endStr }),
      getStatisticsTrendDaily({ metric: 'newUv', start: startStr, end: endStr }),
      getStatisticsTrendDaily({ metric: 'articleReads', start: startStr, end: endStr }),
      getStatisticsTrendDaily({ metric: 'talkReads', start: startStr, end: endStr }),
      getStatisticsTrendDaily({ metric: 'articleLikes', start: startStr, end: endStr }),
      getStatisticsTrendDaily({ metric: 'talkLikes', start: startStr, end: endStr }),
      getStatisticsTrendDaily({ metric: 'articleComments', start: startStr, end: endStr }),
      getStatisticsTrendDaily({ metric: 'talkComments', start: startStr, end: endStr }),
      getStatisticsTopPages({ start: startStr, end: endStr, limit: 10, orderBy: topPagesOrderBy }),
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

    const pvTrend = fillTrend(pvTrendResp.points || [], dayKeys)
    const uvTrend = fillTrend(uvTrendResp.points || [], dayKeys)
    const sessionsTrend = fillTrend(sessionsTrendResp.points || [], dayKeys)
    const newUvTrend = fillTrend(newUvTrendResp.points || [], dayKeys)

    const articleReadsTrend = fillTrend(articleReadsTrendResp.points || [], dayKeys)
    const talkReadsTrend = fillTrend(talkReadsTrendResp.points || [], dayKeys)
    const articleLikesTrend = fillTrend(articleLikesTrendResp.points || [], dayKeys)
    const talkLikesTrend = fillTrend(talkLikesTrendResp.points || [], dayKeys)
    const articleCommentsTrend = fillTrend(articleCommentsTrendResp.points || [], dayKeys)
    const talkCommentsTrend = fillTrend(talkCommentsTrendResp.points || [], dayKeys)

    const totalReadsTrend = mergeTrendSum(articleReadsTrend, talkReadsTrend)
    const totalLikesTrend = mergeTrendSum(articleLikesTrend, talkLikesTrend)
    const totalCommentsTrend = mergeTrendSum(articleCommentsTrend, talkCommentsTrend)

    return {
      articleCount: articleStats.totalCount,
      categoryCount: categories.length,
      tagCount: tags.length,
      talkCount: talksResp.total || talks.length,
      articleTrend: recentMonthArticleTrend,
      talkTrend: recentMonthTalkTrend,
      overview,
      pvTrend,
      uvTrend,
      sessionsTrend,
      newUvTrend,
      totalReadsTrend,
      totalLikesTrend,
      totalCommentsTrend,
      topPages: topPages || [],
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
      talkCount: 0,
      articleTrend: [],
      talkTrend: [],
      overview: {
        uv: 0,
        newUv: 0,
        sessions: 0,
        pv: 0,
        pagesPerSession: 0,
        articleReads: 0,
        talkReads: 0,
        totalReads: 0,
        articleLikes: 0,
        talkLikes: 0,
        totalLikes: 0,
        articleComments: 0,
        talkComments: 0,
        totalComments: 0,
      },
      pvTrend: [],
      uvTrend: [],
      sessionsTrend: [],
      newUvTrend: [],
      totalReadsTrend: [],
      totalLikesTrend: [],
      totalCommentsTrend: [],
      topPages: [],
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

function generateDaysBetween(start: string, end: string): string[] {
  const startDay = dayjs(start).startOf('day')
  const endDay = dayjs(end).startOf('day')
  const days = endDay.diff(startDay, 'day')
  const result: string[] = []
  for (let i = 0; i <= days; i++) {
    result.push(startDay.add(i, 'day').format('YYYY-MM-DD'))
  }
  return result
}

function fillTrend(points: TrendData[], dayKeys: string[]): TrendData[] {
  const map: Record<string, number> = {}
  for (const item of points) {
    map[item.date] = item.value || 0
  }
  return dayKeys.map((date) => ({ date, value: map[date] || 0 }))
}

function mergeTrendSum(a: TrendData[], b: TrendData[]): TrendData[] {
  const map: Record<string, number> = {}
  for (const item of a) {
    map[item.date] = (map[item.date] || 0) + (item.value || 0)
  }
  for (const item of b) {
    map[item.date] = (map[item.date] || 0) + (item.value || 0)
  }
  return Object.keys(map)
    .sort()
    .map((date) => ({ date, value: map[date] || 0 }))
}


// ========== 新统计接口 ==========

// 获取统计总览
export const getStatisticsOverview = (params: {
  start: string
  end: string
}): Promise<StatisticsOverview> => {
  return request.get('/admin/statistics/overview', { params })
}

// 获取每日趋势
export const getStatisticsTrendDaily = (params: {
  metric: string
  start: string
  end: string
}): Promise<DailyTrendData> => {
  return request.get('/admin/statistics/trend/daily', { params })
}

// 获取Top页面
export const getStatisticsTopPages = (params: {
  start: string
  end: string
  limit?: number
  orderBy?: 'pv' | 'uv' | 'sessions'
}): Promise<TopPageItem[]> => {
  return request.get('/admin/statistics/pages/top', { params })
}
