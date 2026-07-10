import request from './request'
import { ArticleStatistics, VisitorStatistics, DashboardStatistics, TrendData, Article, PageResult, Talk, Category, Tag, Comment, StatisticsOverview, DailyTrendData, TopPageItem, TrafficSourceItem, LandingPageItem } from '@/types'
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
  const end = params?.end ? dayjs(params.end) : dayjs().endOf('day')
  const start = params?.start ? dayjs(params.start) : dayjs().subtract(29, 'day').startOf('day')
  const startStr = start.format('YYYY-MM-DDTHH:mm:ss')
  const endStr = end.format('YYYY-MM-DDTHH:mm:ss')
  const topPagesOrderBy = params?.topPagesOrderBy || 'pv'
  const dayKeys = generateDaysBetween(startStr, endStr)

  // 用 allSettled 替代 all：单个子请求失败不应导致整个仪表盘返回全 0 假数据，
  // 而是让成功的数据正常展示、失败的数据降级为空。
  const [
    articleStatsR, categoriesR, tagsR, articlesRespR, talksRespR, overviewR,
    pvTrendR, uvTrendR, sessionsTrendR, newUvTrendR,
    articleReadsTrendR, talkReadsTrendR, articleLikesTrendR, talkLikesTrendR,
    articleCommentsTrendR, talkCommentsTrendR, topPagesR,
  ] = await Promise.allSettled([
    getArticleStatistics(),
    getCategoryList(),
    getTagList(),
    // 仅拉取最近 5 篇用于"最近文章"卡片，不再拉 200 篇到前端排序（后端暂无 Top 文章聚合接口）
    getArticleList({ page: 1, size: 5 }),
    getTalkList({ page: 1, size: 1 }),
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

  const articleStats = fulfilled(articleStatsR, {} as ArticleStatistics)
  const categories = fulfilled(categoriesR, [])
  const tags = fulfilled(tagsR, [])
  const articlesResp = fulfilled(articlesRespR, {} as PageResult<Article>)
  const talksResp = fulfilled(talksRespR, {} as PageResult<Talk>)
  const overview = fulfilled(overviewR, {
    uv: 0, newUv: 0, sessions: 0, pv: 0, pagesPerSession: 0,
    articleReads: 0, talkReads: 0, totalReads: 0,
    articleLikes: 0, talkLikes: 0, totalLikes: 0,
    articleComments: 0, talkComments: 0, totalComments: 0,
  })

  const articles = articlesResp.records || []

  const pointsOf = (r: PromiseSettledResult<DailyTrendData>) => (r.status === 'fulfilled' ? r.value.points : []) || []
  const pvTrend = fillTrend(pointsOf(pvTrendR), dayKeys)
  const uvTrend = fillTrend(pointsOf(uvTrendR), dayKeys)
  const sessionsTrend = fillTrend(pointsOf(sessionsTrendR), dayKeys)
  const newUvTrend = fillTrend(pointsOf(newUvTrendR), dayKeys)

  const articleReadsTrend = fillTrend(pointsOf(articleReadsTrendR), dayKeys)
  const talkReadsTrend = fillTrend(pointsOf(talkReadsTrendR), dayKeys)
  const articleLikesTrend = fillTrend(pointsOf(articleLikesTrendR), dayKeys)
  const talkLikesTrend = fillTrend(pointsOf(talkLikesTrendR), dayKeys)
  const articleCommentsTrend = fillTrend(pointsOf(articleCommentsTrendR), dayKeys)
  const talkCommentsTrend = fillTrend(pointsOf(talkCommentsTrendR), dayKeys)

  const totalReadsTrend = mergeTrendSum(articleReadsTrend, talkReadsTrend)
  const totalLikesTrend = mergeTrendSum(articleLikesTrend, talkLikesTrend)
  const totalCommentsTrend = mergeTrendSum(articleCommentsTrend, talkCommentsTrend)

  return {
    articleCount: articleStats.totalCount,
    categoryCount: categories.length,
    tagCount: tags.length,
    talkCount: talksResp.total || (talksResp.records?.length ?? 0),
    articleTrend: [],
    talkTrend: [],
    overview,
    pvTrend,
    uvTrend,
    sessionsTrend,
    newUvTrend,
    totalReadsTrend,
    totalLikesTrend,
    totalCommentsTrend,
    topPages: fulfilled(topPagesR, []),
    // Top 文章按浏览/点赞排序需要后端聚合接口，暂返回空避免拉全量文章到前端
    topViewedArticles: [],
    topLikedArticles: [],
    categoryDistribution: [],
    tagStatistics: [],
    recentArticles: articles.slice(0, 5),
    recentComments: [],
  }
}

/**
 * 从 Promise.allSettled 的 settled 结果中安全取值：fulfilled 返回真实值，rejected 返回 fallback 并记录错误。
 */
function fulfilled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  if (result.status === 'fulfilled') return result.value
  console.error('仪表盘子请求失败', (result as PromiseRejectedResult).reason)
  return fallback
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

export const getStatisticsTrafficSources = (params: {
  start: string
  end: string
}): Promise<TrafficSourceItem[]> => {
  return request.get('/admin/statistics/sources', { params })
}

export const getStatisticsTopLandingPages = (params: {
  start: string
  end: string
  limit?: number
  orderBy?: 'sessions' | 'uv'
  source?: 'ALL' | 'DIRECT' | 'SEARCH' | 'REFERRAL' | 'UTM'
}): Promise<LandingPageItem[]> => {
  return request.get('/admin/statistics/landing-pages/top', { params })
}
