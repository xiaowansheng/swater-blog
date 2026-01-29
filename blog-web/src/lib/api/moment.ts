import { fetchServer } from './server';
import { fetchClient } from './client';
import type { MomentVO, PageResult } from '@/types';

export const momentApi = {
  getList: (page: number = 1, size: number = 10) => {
    return fetchServer<PageResult<MomentVO>>(
      `/api/public/moment/list?page=${page}&size=${size}`,
      { next: { tags: ['moment:list'] } }
    );
  },

  getById: (id: number) => {
    return fetchServer<MomentVO>(`/api/public/moment/${id}`, {
      next: { tags: [`moment:detail:id:${id}`] },
    });
  },

  getByKey: (key: string) => {
    return fetchServer<MomentVO>(`/api/public/moment/key/${key}`, {
      next: { tags: [`moment:detail:key:${key}`] },
    });
  },

  client: {
    getStats: (ids: number[]) => {
      const param = ids.filter(Boolean).join(',');
      return fetchClient<Array<{ id: number; viewCount: number; likeCount: number; commentCount: number }>>(
        `/api/public/moment/stats?ids=${encodeURIComponent(param)}`,
        { method: 'GET', silent: true }
      );
    },

    getStatsById: (id: number) => {
      return fetchClient<{ id: number; viewCount: number; likeCount: number; commentCount: number }>(
        `/api/public/moment/${id}/stats`,
        { method: 'GET', silent: true }
      );
    },
  },
};
