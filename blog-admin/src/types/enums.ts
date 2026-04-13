/**
 * 文章状态枚举
 */
export enum ArticleStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  PRIVATE = 2,
}

/**
 * 通用启用状态枚举
 */
export enum EnableStatus {
  DISABLED = 0,
  ENABLED = 1,
}

/**
 * 通知已读状态枚举
 */
export enum NotificationReadStatus {
  UNREAD = 0,
  READ = 1,
}

/**
 * 操作结果状态枚举
 */
export enum OperationResultStatus {
  FAILED = 0,
  SUCCESS = 1,
}

/**
 * 接口公开状态枚举
 */
export enum ApiOpenStatus {
  CLOSED = 0,
  OPEN = 1,
}

/**
 * 通知发送状态枚举
 */
export enum NotificationSendStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

/**
 * 置顶状态枚举
 */
export enum TopStatus {
  NORMAL = 0,
  PINNED = 1,
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
 * 友链审核状态枚举
 */
export enum FriendLinkReviewStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

/**
 * 友链可见状态枚举
 */
export enum FriendLinkVisibilityStatus {
  HIDDEN = 0,
  VISIBLE = 1,
}

/**
 * 评论审核状态枚举
 */
export enum CommentStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

/**
 * 评论可见状态枚举
 */
export enum CommentVisibilityStatus {
  HIDDEN = 0,
  VISIBLE = 1,
}

/**
 * 留言审核状态枚举
 */
export enum GuestbookReviewStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = -1,
}

/**
 * 留言可见状态枚举
 */
export enum GuestbookVisibilityStatus {
  HIDDEN = 0,
  VISIBLE = 1,
}

/**
 * 状态映射表，用于显示
 */
export const ARTICLE_STATUS_MAP = {
  [ArticleStatus.DRAFT]: { color: 'default', label: '草稿' },
  [ArticleStatus.PUBLISHED]: { color: 'success', label: '已发布' },
  [ArticleStatus.PRIVATE]: { color: 'warning', label: '私密' },
}

export const ENABLE_STATUS_MAP = {
  [EnableStatus.DISABLED]: { color: 'default', label: '禁用' },
  [EnableStatus.ENABLED]: { color: 'success', label: '启用' },
}

export const NOTIFICATION_READ_STATUS_MAP = {
  [NotificationReadStatus.UNREAD]: { color: 'blue', label: '未读' },
  [NotificationReadStatus.READ]: { color: 'default', label: '已读' },
}

export const OPERATION_RESULT_STATUS_MAP = {
  [OperationResultStatus.FAILED]: { color: 'error', label: '失败' },
  [OperationResultStatus.SUCCESS]: { color: 'success', label: '成功' },
}

export const API_OPEN_STATUS_MAP = {
  [ApiOpenStatus.CLOSED]: { color: 'default', label: '否' },
  [ApiOpenStatus.OPEN]: { color: 'success', label: '是' },
}

export const NOTIFICATION_SEND_STATUS_MAP = {
  [NotificationSendStatus.PENDING]: { color: 'default', label: '待处理' },
  [NotificationSendStatus.QUEUED]: { color: 'processing', label: '已入队' },
  [NotificationSendStatus.SENT]: { color: 'success', label: '已发送' },
  [NotificationSendStatus.FAILED]: { color: 'error', label: '失败' },
}

export const TOP_STATUS_MAP = {
  [TopStatus.NORMAL]: { color: 'default', label: '普通' },
  [TopStatus.PINNED]: { color: 'red', label: '置顶' },
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

export const FRIEND_LINK_REVIEW_STATUS_MAP = {
  [FriendLinkReviewStatus.PENDING]: { color: 'warning', label: '待审核' },
  [FriendLinkReviewStatus.APPROVED]: { color: 'success', label: '已审核' },
  [FriendLinkReviewStatus.REJECTED]: { color: 'error', label: '已拒绝' },
}

export const FRIEND_LINK_VISIBILITY_STATUS_MAP = {
  [FriendLinkVisibilityStatus.HIDDEN]: { color: 'default', label: '不可见' },
  [FriendLinkVisibilityStatus.VISIBLE]: { color: 'processing', label: '可见' },
}

export const COMMENT_STATUS_MAP = {
  [CommentStatus.PENDING]: { color: 'warning', label: '待审核' },
  [CommentStatus.APPROVED]: { color: 'success', label: '已通过' },
  [CommentStatus.REJECTED]: { color: 'error', label: '已拒绝' },
}

export const COMMENT_VISIBILITY_STATUS_MAP = {
  [CommentVisibilityStatus.HIDDEN]: { color: 'default', label: '隐藏' },
  [CommentVisibilityStatus.VISIBLE]: { color: 'success', label: '可见' },
}

export const GUESTBOOK_REVIEW_STATUS_MAP = {
  [GuestbookReviewStatus.PENDING]: { color: 'warning', label: '待审核' },
  [GuestbookReviewStatus.APPROVED]: { color: 'success', label: '已通过' },
  [GuestbookReviewStatus.REJECTED]: { color: 'error', label: '已拒绝' },
}

export const GUESTBOOK_VISIBILITY_STATUS_MAP = {
  [GuestbookVisibilityStatus.HIDDEN]: { color: 'default', label: '隐藏' },
  [GuestbookVisibilityStatus.VISIBLE]: { color: 'success', label: '可见' },
}
