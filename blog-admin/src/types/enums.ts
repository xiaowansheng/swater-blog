/**
 * 文章状态枚举
 */
export enum ArticleStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  PRIVATE = 2,
}

/**
 * 文章类型枚举
 */
export enum ArticleType {
  ORIGINAL = '1',
  REPOST = '2',
  TRANSLATION = '3',
  QUOTE = '4',
}

/**
 * 说说状态枚举
 */
export enum TalkStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PRIVATE = 'private',
}

/**
 * 相册状态枚举
 */
export enum AlbumStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PRIVATE = 'private',
}

/**
 * 分类状态枚举
 */
export enum CategoryStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PRIVATE = 'private',
}

/**
 * 标签状态枚举
 */
export enum TagStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PRIVATE = 'private',
}

/**
 * 图片状态枚举
 */
export enum PictureStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PRIVATE = 'private',
}

/**
 * 状态映射表，用于显示
 */
export const ARTICLE_STATUS_MAP = {
  [ArticleStatus.DRAFT]: { color: 'default', label: '草稿' },
  [ArticleStatus.PUBLISHED]: { color: 'success', label: '已发布' },
  [ArticleStatus.PRIVATE]: { color: 'warning', label: '私密' },
}

export const ARTICLE_TYPE_MAP = {
  [ArticleType.ORIGINAL]: { color: 'blue', label: '原创' },
  [ArticleType.REPOST]: { color: 'orange', label: '转载' },
  [ArticleType.TRANSLATION]: { color: 'purple', label: '翻译' },
  [ArticleType.QUOTE]: { color: 'cyan', label: '引用' },
}

export const TALK_STATUS_MAP = {
  [TalkStatus.DRAFT]: { color: 'default', label: '草稿' },
  [TalkStatus.PUBLISHED]: { color: 'success', label: '已发布' },
  [TalkStatus.PRIVATE]: { color: 'warning', label: '私密' },
}

export const ALBUM_STATUS_MAP = {
  [AlbumStatus.DRAFT]: { color: 'default', label: '草稿' },
  [AlbumStatus.PUBLISHED]: { color: 'success', label: '已发布' },
  [AlbumStatus.PRIVATE]: { color: 'warning', label: '私密' },
}

export const CATEGORY_STATUS_MAP = {
  [CategoryStatus.DRAFT]: { color: 'default', label: '草稿' },
  [CategoryStatus.PUBLISHED]: { color: 'success', label: '已发布' },
  [CategoryStatus.PRIVATE]: { color: 'warning', label: '私密' },
}

export const TAG_STATUS_MAP = {
  [TagStatus.DRAFT]: { color: 'default', label: '草稿' },
  [TagStatus.PUBLISHED]: { color: 'success', label: '已发布' },
  [TagStatus.PRIVATE]: { color: 'warning', label: '私密' },
}

export const PICTURE_STATUS_MAP = {
  [PictureStatus.DRAFT]: { color: 'default', label: '草稿' },
  [PictureStatus.PUBLISHED]: { color: 'success', label: '已发布' },
  [PictureStatus.PRIVATE]: { color: 'warning', label: '私密' },
}
