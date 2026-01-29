import { fetchServer } from './server';
import type { CategoryVO } from '@/types';

export const categoryApi = {
  getList: () => {
    return fetchServer<CategoryVO[]>('/api/public/category/list', {
      next: { tags: ['category:list'] },
    });
  },

  getById: (id: number) => {
    return fetchServer<CategoryVO>(`/api/public/category/${id}`, {
      next: { tags: [`category:detail:id:${id}`] },
    });
  },

  getByKey: (key: string) => {
    return fetchServer<CategoryVO>(`/api/public/category/key/${key}`, {
      next: { tags: [`category:detail:key:${key}`] },
    });
  },
};

