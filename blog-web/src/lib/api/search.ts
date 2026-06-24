import { fetchServer } from './server';
import type { SearchVO, PageResult } from '@/types';

export interface SearchParams {
  keyword: string;
  type?: 'post' | 'moment' | 'comment';
  page?: number;
  size?: number;
  categoryId?: number;
}

export const searchApi = {
  search: (params: SearchParams) => {
    const searchParams = new URLSearchParams();
    searchParams.append('keyword', params.keyword);
    if (params.type) searchParams.append('type', params.type);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.size) searchParams.append('size', params.size.toString());
    if (params.categoryId) searchParams.append('categoryId', params.categoryId.toString());
    return fetchServer<PageResult<SearchVO>>(
      `/api/public/search?${searchParams.toString()}`
    );
  },

  facets: (keyword: string) => {
    return fetchServer<Record<string, number>>(
      `/api/public/search/facets?keyword=${encodeURIComponent(keyword)}`
    );
  },
};

