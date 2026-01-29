import { fetchServer } from './server';
import type { ArchiveVO, PostVO, PageResult } from '@/types';

export const archiveApi = {
  getList: () => {
    return fetchServer<ArchiveVO[]>('/api/public/archive/list', {
      next: { tags: ['archive:list'] },
    });
  },

  getByYearMonth: (year: number, month: number, page: number = 1, size: number = 10) => {
    return fetchServer<PageResult<PostVO>>(
      `/api/public/archive/${year}/${month}?page=${page}&size=${size}`,
      { next: { tags: [`archive:month:${year}-${String(month).padStart(2, '0')}`] } }
    );
  },
};

