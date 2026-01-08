/**
 * 二次元评论组件导出
 */

// 主组件
export { default as AnimeComment } from './AnimeComment';
export { default as AnimeCommentForm } from './AnimeCommentForm';
export { default as AnimeCommentList } from './AnimeCommentList';
export { default as AnimeCommentItem } from './AnimeCommentItem';
export { default as EmojiPicker } from './EmojiPicker';

// 类型
export type {
  Emoji,
  AnimeCommentVO,
  CommentFormData,
  AnimeCommentConfig,
  AnimeCommentProps,
} from './types';

// 常量
export {
  ANIME_AVATARS,
  getRandomAnimeAvatar,
  KAOMOJI_EMOJIS,
  DEFAULT_COMMENT_CONFIG,
} from './constants';

// 样式
import './animations.css';
