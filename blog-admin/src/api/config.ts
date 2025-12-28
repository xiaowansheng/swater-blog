import request from './request'

// 配置类型定义
export interface SiteConfig {
  name: string
  description: string
  keywords: string
  logo: string
  favicon: string
  createTime: string
  icp: string
  police: string
  copyright: string
  notice: string
}

export interface AuthorConfig {
  name: string
  avatar: string
  signature: string
  introduction: string
  email: string
  qq: string
  wechat: string
  github: string
  gitee: string
  weibo: string
  zhihu: string
  bilibili: string
  showEmail: boolean
  showQq: boolean
  showWechat: boolean
}

export interface CoverConfig {
  home: string
  article: string
  archive: string
  category: string
  tag: string
  talk: string
  album: string
  link: string
  about: string
  message: string
  default: string
}

export interface SocialConfig {
  github: string
  gitee: string
  weibo: string
  zhihu: string
  bilibili: string
  twitter: string
  facebook: string
}

export interface PrivacyConfig {
  showIp: boolean
  showLocation: boolean
  showDevice: boolean
  showBrowser: boolean
}

export interface CommentConfig {
  enableAudit: boolean
  allowAnonymous: boolean
  allowGuest: boolean
  showEmail: boolean
  pageSize: number
}

export interface NotifyConfig {
  loginEmail: boolean
  commentEmail: boolean
  replyEmail: boolean
  guestbookEmail: boolean
  friendLinkEmail: boolean
}

export interface UploadConfig {
  maxSize: number
  allowedTypes: string
  imageCompress: boolean
  imageQuality: number
}

export interface EmailConfig {
  enable: boolean
  host: string
  port: number
  username: string
  password?: string
  fromName: string
}

// API 方法
export const getSiteConfig = (): Promise<SiteConfig> => request.get('/admin/site-config/site')
export const updateSiteConfig = (data: SiteConfig): Promise<void> => request.put('/admin/site-config/site', data)

export const getAuthorConfig = (): Promise<AuthorConfig> => request.get('/admin/site-config/author')
export const updateAuthorConfig = (data: AuthorConfig): Promise<void> => request.put('/admin/site-config/author', data)

export const getCoverConfig = (): Promise<CoverConfig> => request.get('/admin/site-config/cover')
export const updateCoverConfig = (data: CoverConfig): Promise<void> => request.put('/admin/site-config/cover', data)

export const getSocialConfig = (): Promise<SocialConfig> => request.get('/admin/site-config/social')
export const updateSocialConfig = (data: SocialConfig): Promise<void> => request.put('/admin/site-config/social', data)

export const getPrivacyConfig = (): Promise<PrivacyConfig> => request.get('/admin/site-config/privacy')
export const updatePrivacyConfig = (data: PrivacyConfig): Promise<void> => request.put('/admin/site-config/privacy', data)

export const getCommentConfig = (): Promise<CommentConfig> => request.get('/admin/site-config/comment')
export const updateCommentConfig = (data: CommentConfig): Promise<void> => request.put('/admin/site-config/comment', data)

export const getNotifyConfig = (): Promise<NotifyConfig> => request.get('/admin/site-config/notify')
export const updateNotifyConfig = (data: NotifyConfig): Promise<void> => request.put('/admin/site-config/notify', data)

export const getUploadConfig = (): Promise<UploadConfig> => request.get('/admin/site-config/upload')
export const updateUploadConfig = (data: UploadConfig): Promise<void> => request.put('/admin/site-config/upload', data)

export const getEmailConfig = (): Promise<EmailConfig> => request.get('/admin/site-config/email')
export const updateEmailConfig = (data: EmailConfig): Promise<void> => request.put('/admin/site-config/email', data)
