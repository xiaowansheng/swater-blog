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

