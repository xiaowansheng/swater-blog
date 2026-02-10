import { fetchClient } from './client';
import type { PostVO, PageResult } from '@/types';

export const archiveApi = {
  client: {
    list: (page: number = 1, size: number = 20) => {
      return fetchClient<PageResult<PostVO>>(
        `/api/public/archive/list?page=${page}&size=${size}`
      );
    },
  },
};
