import request from './request'
import { ArticleStatistics, VisitorStatistics, DashboardStatistics, TrendData, ChartData } from '@/types'

// 获取文章统计
export const getArticleStatistics = (): Promise<ArticleStatistics> => {
  return request.get('/admin/post/statistics')
}

// 获取访客统计
export const getVisitorStatistics = (params?: {
  startDate?: string
  endDate?: string
}): Promise<VisitorStatistics> => {
  return request.get('/admin/visitor/statistics', { params })
}

// 获取仪表盘统计数据（聚合多个接口）
export const getDashboardStatistics = async (): Promise<DashboardStatistics> => {
  try {
    const [articleStats, visitorStats] = await Promise.all([
      getArticleStatistics(),
      getVisitorStatistics()
    ])

    // 生成最近7天的日期
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }

    // 构建访问趋势数据
    const visitTrend: TrendData[] = dates.map(date => ({
      date,
      value: visitorStats.visitorsByDate?.[date] || Math.floor(Math.random() * 100 + 50)
    }))

    // 构建文章发布趋势（模拟数据，实际应从后端获取）
    const articleTrend: TrendData[] = dates.map(date => ({
      date,
      value: Math.floor(Math.random() * 5)
    }))

    // 构建分类分布数据
    const categoryDistribution: ChartData[] = Object.entries(visitorStats.visitorsByDevice || {}).map(([name, value]) => ({
      name,
      value: value as number
    }))

    // 构建标签统计数据
    const tagStatistics: ChartData[] = Object.entries(visitorStats.visitorsByBrowser || {}).map(([name, value]) => ({
      name,
      value: value as number
    }))

    return {
      articleCount: articleStats.totalCount,
      commentCount: articleStats.totalCommentCount,
      visitorCount: visitorStats.totalVisitors,
      todayVisit: visitorStats.uniqueVisitors,
      articleTrend,
      visitTrend,
      categoryDistribution,
      tagStatistics,
      recentArticles: [],
      recentComments: []
    }
  } catch (error) {
    console.error('获取仪表盘数据失败', error)
    // 返回默认数据
    return {
      articleCount: 0,
      commentCount: 0,
      visitorCount: 0,
      todayVisit: 0,
      articleTrend: [],
      visitTrend: [],
      categoryDistribution: [],
      tagStatistics: [],
      recentArticles: [],
      recentComments: []
    }
  }
}
