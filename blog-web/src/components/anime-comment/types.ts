import { CommentVO } from '@/types';

/**
 * 表情包类型
 */
export interface Emoji {
  id: string;
  name: string;
  url: string;
  category: string;
}

/**
 * 二次元评论扩展类型
 */
export interface AnimeCommentVO extends CommentVO {
  // 头像类型
  avatarType?: 'default' | 'anime' | 'custom';
  // 自定义头像URL
  customAvatar?: string;
  // 评论图片
  images?: string[];
  // 是否为新评论（用于动画效果）
  isNew?: boolean;
}

/**
 * 评论表单数据
 */
export interface CommentFormData {
  nickname: string;
  email?: string;
  qq?: string;
  captcha?: string;
  content: string;
  images?: File[];
  targetType: 'ARTICLE' | 'TALK';
  targetId?: number;
  parentId?: number;
  rootId?: number;
}

/**
 * 评论组件配置
 */
export interface AnimeCommentConfig {
  // 是否允许匿名评论
  allowAnonymous: boolean;
  // 是否允许游客评论
  allowGuest: boolean;
  // 是否启用审核
  enableAudit: boolean;
  // 是否显示邮箱
  showEmail: boolean;
  // 是否允许上传图片
  allowImage: boolean;
  // 最大图片数量
  maxImages: number;
  // 最大图片大小（MB）
  maxImageSize: number;
}

/**
 * 评论组件Props
 */
export interface AnimeCommentProps {
  // 文章ID
  postId?: number;
  // 动态ID
  momentId?: number;
  // 评论配置
  config?: Partial<AnimeCommentConfig>;
  // 是否显示标题
  showTitle?: boolean;
  // 自定义class名
  className?: string;
}
