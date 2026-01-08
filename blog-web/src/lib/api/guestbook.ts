import { fetchServer } from './server';
import { fetchClient } from './client';
import type { GuestbookVO, PageResult } from '@/types';

export interface GuestbookSubmitDTO {
  nickname?: string;
  email?: string;
  qq?: string;
  type?: string;
  images?: string[];
  content: string;
}

export const guestbookApi = {
  getList: (page: number = 1, size: number = 10) => {
    return fetchServer<PageResult<GuestbookVO>>(
      `/api/public/guestbook/list?page=${page}&size=${size}`
    );
  },

  submit: (data: GuestbookSubmitDTO) => {
    return fetchClient<GuestbookVO>('/api/public/guestbook', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

