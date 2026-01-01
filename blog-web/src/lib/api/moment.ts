import { fetchServer } from './server';
import type { MomentVO, PageResult } from '@/types';

export const momentApi = {
  getList: (page: number = 1, size: number = 10) => {
    return fetchServer<PageResult<MomentVO>>(
      `/api/public/moment/list?page=${page}&size=${size}`
    );
  },

  getById: (id: number) => {
    return fetchServer<MomentVO>(`/api/public/moment/${id}`);
  },

  getByKey: (key: string) => {
    return fetchServer<MomentVO>(`/api/public/moment/key/${key}`);
  },
};

