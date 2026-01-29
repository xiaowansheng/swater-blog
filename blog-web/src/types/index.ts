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
  twitter?: string;
  telegram?: string;
  facebook?: string;
  youtube?: string;
}

/**
 * 后台管理的作者配置类型（包含所有配置项）
 */
export interface AuthorConfig {
  name: string;
  avatar: string;
  signature: string;
  introduction: string;
  contactMethods: {
    email?: { value: string; visible: boolean };
    qq?: { value: string; visible: boolean };
    wechat?: { value: string; visible: boolean };
  };
  socialLinks: {
    github?: { value: string; visible: boolean };
    gitee?: { value: string; visible: boolean };
    weibo?: { value: string; visible: boolean };
    zhihu?: { value: string; visible: boolean };
    bilibili?: { value: string; visible: boolean };
    twitter?: { value: string; visible: boolean };
    telegram?: { value: string; visible: boolean };
    facebook?: { value: string; visible: boolean };
    youtube?: { value: string; visible: boolean };
  };
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

export interface ComponentConfig {
  articleCommentEnabled: boolean;
  talkCommentEnabled: boolean;
  guestbookMessageEnabled: boolean;
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
  component?: ComponentConfig;
}

export interface PostVO {
  id: number;
  articleKey: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover?: string;
  authorId: number;
  authorName?: string;
  authorAvatar?: string;
  categoryId?: number;
  categoryKey?: string;
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
  categoryKey: string;
  name: string;
  description?: string;
  articleCount?: number;
}

export interface TagVO {
  id: number;
  tagKey: string;
  name: string;
  color?: string;
  articleCount?: number;
}

export interface CommentVO {
  id: number;
  postId?: number;
  momentId?: number;
  parentId?: number;
  rootId?: number;
  nickname: string;
  email?: string;
  avatar?: string;
  content: string;
  status: number;
  isVisible?: number;
  statusText?: string;
  replyCount?: number;
  likeCount?: number;
  isAuthor?: boolean;
  isOwner?: boolean;
  replyToUser?: {
    id?: number;
    nickname?: string;
  };
  ip?: string;
  country?: string;
  province?: string;
  city?: string;
  location?: string;
  ipLocation?: string;
  device?: string;
  browser?: string;
  createTime: string;
  children?: CommentVO[];
}

export interface GuestbookVO {
  id: number;
  content: string;
  images?: string[];
  userId?: number;
  userName?: string;
  type?: string;
  nickname?: string;
  email?: string;
  qq?: string;
  ip?: string;
  country?: string;
  province?: string;
  city?: string;
  location?: string;
  ipLocation?: string;
  device?: string;
  browser?: string;
  isVisible?: number;
  reviewStatus?: number;
  createTime: string;
}

export interface ArchiveVO {
  year: number;
  month: number;
  postCount: number;
  publishedCount?: number;
  draftCount?: number;
  privateCount?: number;
}

export interface MomentVO {
  id: number;
  talkKey: string;
  content: string;
  images?: string[];
  authorId: number;
  authorName?: string;
  authorAvatar?: string;
  viewCount?: number;
  likeCount: number;
  commentCount: number;
  ip?: string;
  country?: string;
  province?: string;
  city?: string;
  location?: string;
  ipLocation?: string;
  device?: string;
  browser?: string;
  isTop?: boolean;
  createTime: string;
}

export interface FriendLinkVO {
  id: number;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  category?: string;
  author?: string;
}

export interface FriendLinkApplicationDTO {
  name: string;
  url: string;
  logo?: string;
  description: string;
  author: string;
  email: string;
  emailCode?: string;
}

export interface SearchVO {
  id: number;
  articleKey?: string;
  type: 'post' | 'moment' | 'comment';
  title: string;
  content: string;
  excerpt?: string;
  highlight?: string;
  createTime: string;
  url?: string;
  // 评论相关字段
  targetId?: number;
  targetType?: string;
}

export interface AboutVO {
  content: string;
}

// 音乐播放器配置相关类型
export interface Song {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  url: string;
  duration?: number;
}

export interface MusicConfig {
  /** 默认播放列表 */
  defaultPlaylist: Song[];
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 默认音量 0-1 */
  defaultVolume?: number;
  /** 默认播放模式 */
  defaultPlayMode?: 'sequential' | 'shuffle' | 'repeat';
}
