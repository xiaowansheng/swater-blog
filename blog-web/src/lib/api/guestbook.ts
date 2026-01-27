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
  getList: (page: number = 1, size: number = 10, sort?: string) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (sort) params.append('sort', sort);
    return fetchServer<PageResult<GuestbookVO>>(
      `/api/public/guestbook/list?${params.toString()}`
    );
  },
  getListClient: (page: number = 1, size: number = 10, sort?: string) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (sort) params.append('sort', sort);
    return fetchClient<PageResult<GuestbookVO>>(
      `/api/public/guestbook/list?${params.toString()}`
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

