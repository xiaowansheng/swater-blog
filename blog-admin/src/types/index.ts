// API响应类型
export interface Result<T> {
  code: number
  message: string
  data: T
  timestamp: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 用户相关
export interface User {
  id: number
  username: string
  nickname: string
  email: string
  avatar: string
  phone?: string
  qq?: string
  signature?: string
  website?: string
  introduction?: string
  role?: string
  status: number
  disabled: number
  lastLoginTime?: string
  lastLoginIp?: string
  roles: Role[]
  createTime?: string
  updateTime?: string
}

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  status?: number
  createTime?: string
}

// 文章相关
export interface Article {
  id: number
  articleKey?: string
  title: string
  slug?: string
  content: string
  excerpt?: string
  summary?: string
  cover: string
  authorId?: number
  authorName?: string
  categoryId: number
  categoryName: string
  type?: string
  originalAuthor?: string
  originalTitle?: string
  originalUrl?: string
  note?: string
  status: number
  isTop: number
  viewCount: number
  likeCount?: number
  commentCount: number
  publishedAt?: string
  tags: Tag[]
  createTime: string
  updateTime?: string
}

export interface ArticleStatistics {
  totalCount: number
  publishedCount: number
  draftCount: number
  totalViewCount: number
  totalLikeCount: number
  totalCommentCount: number
}


// 分类相关
export interface Category {
  id: number
  categoryKey?: string
  name: string
  slug?: string
  description: string
  parentId?: number
  sort?: number
  status?: string
  articleCount?: number
  children?: Category[]
  createTime?: string
}

// 标签相关
export interface Tag {
  id: number
  name: string
  slug?: string
  color?: string
  description?: string
  articleCount?: number
  createTime?: string
}

// 评论相关
export interface Comment {
  id: number
  content: string
  authorName: string
  authorEmail: string
  authorAvatar?: string
  authorUrl?: string
  status: number
  targetType: string
  targetId: number
  targetTitle?: string
  postId?: number
  postTitle?: string
  parentId?: number
  replyToId?: number
  ip?: string
  userAgent?: string
  createTime: string
  children?: Comment[]
}

// 说说相关
export interface Talk {
  id: number
  content: string
  images?: string[]
  isTop: number
  status: number
  likeCount: number
  commentCount: number
  createTime: string
  updateTime?: string
}

// 通知相关
export interface Notification {
  id: number
  type: string
  title: string
  content: string
  isRead: number
  targetType?: string
  targetId?: number
  createTime: string
}

// 友链相关
export interface FriendLink {
  id: number
  name: string
  url: string
  logo: string
  description: string
  sort?: number
  status: number
  createTime: string
}

// 文件相关
export interface FileMeta {
  id: number
  fileKey: string
  originalName: string
  storageName: string
  storagePath: string
  url: string
  fileSize: number
  mimeType: string
  fileType: string
  storageType: string
  md5?: string
  width?: number
  height?: number
  duration?: number
  createTime: string
}

// 访客相关
export interface Visitor {
  id: number
  visitorKey: string
  ip: string
  country?: string
  province?: string
  city?: string
  isp?: string
  deviceType?: string
  deviceBrand?: string
  os?: string
  osVersion?: string
  browser?: string
  browserVersion?: string
  firstVisitTime: string
  lastVisitTime: string
  visitCount: number
}

export interface VisitorStatistics {
  totalVisitors: number
  totalPageViews: number
  uniqueVisitors: number
  visitorsByDate?: Record<string, number>
  visitorsByCountry?: Record<string, number>
  visitorsByCity?: Record<string, number>
  visitorsByDevice?: Record<string, number>
  visitorsByBrowser?: Record<string, number>
  visitorsByOs?: Record<string, number>
}

// 日志相关
export interface LogOperation {
  id: number
  module: string
  operation: string
  method: string
  requestUri: string
  requestMethod: string
  requestParams?: string
  responseResult?: string
  userId?: number
  username?: string
  ip: string
  location?: string
  userAgent?: string
  executionTime: number
  status: number
  errorMessage?: string
  createTime: string
}

export interface LogError {
  id: number
  requestUri: string
  requestMethod: string
  requestParams?: string
  userId?: number
  username?: string
  ip: string
  userAgent?: string
  errorMessage: string
  stackTrace?: string
  createTime: string
}

// 菜单相关
export interface Menu {
  id: number
  name: string
  path: string
  component?: string
  icon?: string
  parentId?: number
  sort: number
  visible: number
  status: number
  children?: Menu[]
  createTime?: string
}

// 系统配置
export interface SysConfig {
  id: number
  configKey: string
  configValue: string
  configType: string
  description?: string
  createTime?: string
  updateTime?: string
}

// 相册相关
export interface Album {
  id: number
  name: string
  description?: string
  cover?: string
  status: number
  sort?: number
  pictureCount?: number
  createTime: string
}

export interface Picture {
  id: number
  albumId: number
  url: string
  description?: string
  sort?: number
  createTime: string
}

// 留言相关
export interface Guestbook {
  id: number
  nickname: string
  email?: string
  avatar?: string
  content: string
  ip?: string
  location?: string
  status: number
  parentId?: number
  replyTo?: string
  createTime: string
  children?: Guestbook[]
}

// 关于页面
export interface About {
  id: number
  title: string
  content: string
  updateTime: string
}

// 标签页相关
export interface TabItem {
  key: string
  label: string
  path: string
  closable?: boolean
  keepAlive?: boolean
}

export interface TabState {
  tabs: TabItem[]
  activeKey: string
}

// Dashboard统计
export interface DashboardStatistics {
  articleCount: number
  commentCount: number
  visitorCount: number
  todayVisit: number
  articleTrend: TrendData[]
  visitTrend: TrendData[]
  categoryDistribution: ChartData[]
  tagStatistics: ChartData[]
  recentArticles: Article[]
  recentComments: Comment[]
}

export interface TrendData {
  date: string
  value: number
}

export interface ChartData {
  name: string
  value: number
}
