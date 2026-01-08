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
  emailCode?: string;
}

export const guestbookApi = {
  getList: (page: number = 1, size: number = 10) => {
    return fetchServer<PageResult<GuestbookVO>>(
      `/api/public/guestbook/list?page=${page}&size=${size}`
    );
  },
  getListClient: (page: number = 1, size: number = 10) => {
    return fetchClient<PageResult<GuestbookVO>>(
      `/api/public/guestbook/list?page=${page}&size=${size}`
    );
  },
  sendEmailCode: (email: string) => {
    return fetchClient<void>('/api/public/message/email-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  submit: (data: GuestbookSubmitDTO) => {
    return fetchClient<GuestbookVO>('/api/public/guestbook', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

