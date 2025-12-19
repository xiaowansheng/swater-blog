import { fetchServer } from './server';
import { fetchClient } from './client';
import type { CommentVO, PageResult } from '@/types';

export interface CommentSubmitDTO {
  postId?: number;
  momentId?: number;
  parentId?: number;
  nickname: string;
  email?: string;
  content: string;
}

export const commentApi = {
  getList: (params: {
    postId?: number;
    momentId?: number;
    page?: number;
    size?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.postId) searchParams.append('postId', params.postId.toString());
    if (params.momentId) searchParams.append('momentId', params.momentId.toString());
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

