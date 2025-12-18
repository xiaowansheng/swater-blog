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

export interface User {
  id: number
  username: string
  nickname: string
  email: string
  avatar: string
  roles: Role[]
}

export interface Role {
  id: number
  name: string
  code: string
}

export interface Article {
  id: number
  title: string
  content: string
  summary: string
  cover: string
  status: number
  categoryId: number
  categoryName: string
  tags: Tag[]
  viewCount: number
  commentCount: number
  isTop: boolean
  createTime: string
  updateTime: string
}

export interface Category {
  id: number
  name: string
  description: string
  articleCount: number
}

export interface Tag {
  id: number
  name: string
  color: string
  articleCount: number
}

export interface Comment {
  id: number
  content: string
  authorName: string
  authorEmail: string
  authorAvatar: string
  status: number
  postId: number
  postTitle: string
  parentId: number
  createTime: string
}

export interface Notification {
  id: number
  type: string
  title: string
  content: string
  isRead: number
  createTime: string
}

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

export interface MenuItem {
  id: number
  name: string
  path: string
  icon?: string
  children?: MenuItem[]
}

export interface FriendLink {
  id: number
  name: string
  url: string
  logo: string
  description: string
  status: number
  createTime: string
}

