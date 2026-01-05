import { fetchServer } from './server';
import type { CategoryVO } from '@/types';

export const categoryApi = {
  getList: () => {
    return fetchServer<CategoryVO[]>('/api/public/category/list');
  },

  getById: (id: number) => {
    return fetchServer<CategoryVO>(`/api/public/category/${id}`);
  },

  getByKey: (key: string) => {
    return fetchServer<CategoryVO>(`/api/public/category/key/${key}`);
  },
};

