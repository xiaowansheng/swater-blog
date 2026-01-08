import { fetchServer } from './server';
import { fetchClient } from './client';
import type { CommentVO, PageResult } from '@/types';

export interface CommentSubmitDTO {
  targetId?: number;
  targetType?: 'ARTICLE' | 'TALK';
  parentId?: number;
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
    page?: number;
    size?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.targetId) searchParams.append('targetId', params.targetId.toString());
    if (params.targetType) searchParams.append('targetType', params.targetType);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.size) searchParams.append('size', params.size.toString());
    return fetchServer<PageResult<CommentVO>>(
      `/api/public/comment/list?${searchParams.toString()}`
    );
  },

  submit: (data: CommentSubmitDTO) => {
    return fetchClient<CommentVO>('/api/public/comment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

