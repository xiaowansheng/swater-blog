import { fetchServer } from './server';
import { fetchClient } from './client';
import type { CommentVO, PageResult } from '@/types';

export interface CommentSubmitDTO {
  targetId?: number;
  targetType?: 'ARTICLE' | 'TALK';
  parentId?: number;
  rootId?: number;
  parentNickname?: string;
  nickname: string;
  email?: string;
  qq?: string;
  captcha?: string;
  content: string;
}

export const commentApi = {
  getList: (params: {
    targetId?: number;
    targetType?: 'ARTICLE' | 'TALK';
    parentId?: number;
    rootId?: number;
    page?: number;
    size?: number;
    sort?: 'time' | 'hot';
  }) => {
    const searchParams = new URLSearchParams();
    if (params.targetId) searchParams.append('targetId', params.targetId.toString());
    if (params.targetType) searchParams.append('targetType', params.targetType);
    if (typeof params.parentId === 'number') searchParams.append('parentId', params.parentId.toString());
    if (typeof params.rootId === 'number') searchParams.append('rootId', params.rootId.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.size) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);
    return fetchServer<PageResult<CommentVO>>(
      `/api/public/comment/list?${searchParams.toString()}`
    );
  },

  getTopComments: (params: {
    targetId?: number;
    targetType?: 'ARTICLE' | 'TALK';
    page?: number;
    size?: number;
    sort?: 'time' | 'hot';
  }) => {
    return commentApi.getList({ ...params, parentId: 0 });
  },

  getReplies: (params: {
    parentId?: number;
    rootId: number;
    page?: number;
    size?: number;
    sort?: 'time' | 'hot';
  }) => {
    return commentApi.getList({ ...params });
  },

  submit: (data: CommentSubmitDTO) => {
    return fetchClient<CommentVO>('/api/public/comment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  toggleLike: (commentId: number) => {
    return fetchClient<void>(`/api/public/comment/${commentId}/like`, {
      method: 'POST',
    });
  },

  getCaptcha: () => {
    return fetchClient<{ image: string; key: string }>('/api/public/captcha');
  },

  sendEmailCode: (email: string) => {
    return fetchClient<void>('/api/public/message/email-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

