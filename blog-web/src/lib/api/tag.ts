import { fetchServer } from './server';
import type { TagVO } from '@/types';

export const tagApi = {
  getList: () => {
    return fetchServer<TagVO[]>('/api/public/tag/list');
  },

  getById: (id: number) => {
    return fetchServer<TagVO>(`/api/public/tag/${id}`);
  },

  getByKey: (key: string) => {
    return fetchServer<TagVO>(`/api/public/tag/key/${key}`);
  },
};

