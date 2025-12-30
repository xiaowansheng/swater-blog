export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 网站配置相关类型
export interface SiteInfo {
  name: string;
  description: string;
  keywords: string;
  logo: string;
  favicon: string;
  createTime: string;
  icp: string;
  police: string;
  copyright: string;
  notice: string;
}

export interface AuthorInfo {
  name: string;
  avatar: string;
  signature: string;
  introduction: string;
  // 以下字段根据后台配置决定是否返回
  email?: string;
  qq?: string;
  wechat?: string;
  github?: string;
  gitee?: string;
  weibo?: string;
  zhihu?: string;
  bilibili?: string;
}

export interface CoverConfig {
  home: string;
  article: string;
  archive: string;
  category: string;
  tag: string;
  talk: string;
  album: string;
  link: string;
  about: string;
  message: string;
  default: string;
}

export interface SocialConfig {
  github?: string;
  gitee?: string;
  weibo?: string;
  zhihu?: string;
  bilibili?: string;
  twitter?: string;
  facebook?: string;
}

export interface PrivacyConfig {
  showIp: boolean;
  showLocation: boolean;
  showDevice: boolean;
  showBrowser: boolean;
}

export interface CommentConfig {
  allowAnonymous: boolean;
  allowGuest: boolean;
}

/**
 * 前台公开配置（已过滤敏感信息）
 */
export interface PublicConfigVO {
  site: SiteInfo;
  author: AuthorInfo;
  cover: CoverConfig;
  social: SocialConfig;
  privacy: PrivacyConfig;
  comment: CommentConfig;
}

export interface PostVO {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover?: string;
  authorId: number;
  authorName?: string;
  authorAvatar?: string;
  categoryId?: number;
  categoryName?: string;
  tagIds?: number[];
  tags?: TagVO[];
  status: number;
  isTop: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: string;
  createTime: string;
  updateTime: string;
}

export interface CategoryVO {
  id: number;
  name: string;
  description?: string;
  articleCount?: number;
}

export interface TagVO {
  id: number;
  name: string;
  color?: string;
  articleCount?: number;
}

export interface CommentVO {
  id: number;
  postId?: number;
  momentId?: number;
  parentId?: number;
  nickname: string;
  email?: string;
  avatar?: string;
  content: string;
  status: number;
  ip?: string;
  userAgent?: string;
  createTime: string;
  children?: CommentVO[];
}

export interface ArchiveVO {
  year: number;
  month?: number;
  count: number;
  posts?: PostVO[];
}

export interface MomentVO {
  id: number;
  content: string;
  images?: string[];
  authorId: number;
  authorName?: string;
  authorAvatar?: string;
  likeCount: number;
  commentCount: number;
  createTime: string;
}

export interface FriendLinkVO {
  id: number;
  name: string;
  url: string;
  avatar?: string;
  description?: string;
  category?: string;
}

export interface SearchVO {
  id: number;
  type: 'post' | 'moment' | 'comment';
  title: string;
  content: string;
  highlight?: string;
  url: string;
  createTime: string;
}

export interface AboutVO {
  content: string;
}

