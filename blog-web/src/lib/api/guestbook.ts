import { fetchServer } from './server';
import { fetchClient } from './client';
import type { CommentVO, PageResult } from '@/types';

export interface GuestbookSubmitDTO {
  nickname: string;
  email?: string;
  content: string;
}

export const guestbookApi = {
  getList: (page: number = 1, size: number = 10) => {
    return fetchServer<PageResult<CommentVO>>(
      `/api/public/guestbook/list?page=${page}&size=${size}`
    );
  },

  submit: (data: GuestbookSubmitDTO) => {
    return fetchClient<CommentVO>('/api/public/guestbook', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

