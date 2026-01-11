import { fetchServer } from './server';
import { fetchClient } from './client';
import type { PostVO, PageResult } from '@/types';

export interface ArticleListParams {
  page?: number;
  size?: number;
  categoryId?: number;
  tagId?: number;
  keyword?: string;
}

export const articleApi = {
  getList: (params: ArticleListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.size) searchParams.append('size', params.size.toString());
    if (params.categoryId) searchParams.append('categoryId', params.categoryId.toString());
    if (params.tagId) searchParams.append('tagId', params.tagId.toString());
    if (params.keyword) searchParams.append('keyword', params.keyword);
    return fetchServer<PageResult<PostVO>>(`/api/public/post/list?${searchParams.toString()}`);
  },

  getById: (id: number) => {
    return fetchServer<PostVO>(`/api/public/post/${id}`);
  },

  getBySlug: (slug: string) => {
    return fetchServer<PostVO>(`/api/public/post/slug/${slug}`);
  },

  getByKey: (key: string) => {
    return fetchServer<PostVO>(`/api/public/post/key/${key}`);
  },

  getHot: (limit: number = 10) => {
    return fetchServer<PostVO[]>(`/api/public/post/hot?limit=${limit}`);
  },

  getLatest: (limit: number = 10) => {
    return fetchServer<PostVO[]>(`/api/public/post/latest?limit=${limit}`);
  },

  client: {
    getList: (params: ArticleListParams = {}) => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.size) searchParams.append('size', params.size.toString());
      if (params.categoryId) searchParams.append('categoryId', params.categoryId.toString());
      if (params.tagId) searchParams.append('tagId', params.tagId.toString());
      if (params.keyword) searchParams.append('keyword', params.keyword);
      return fetchClient<PageResult<PostVO>>(`/api/public/post/list?${searchParams.toString()}`);
    },

    getById: (id: number) => {
      return fetchClient<PostVO>(`/api/public/post/${id}`);
    },

    getBySlug: (slug: string) => {
      return fetchClient<PostVO>(`/api/public/post/slug/${slug}`);
    },

    getByKey: (key: string) => {
      return fetchClient<PostVO>(`/api/public/post/key/${key}`);
    },

    getStats: (ids: number[]) => {
      const param = ids.filter(Boolean).join(',');
      return fetchClient<Array<{ id: number; viewCount: number; likeCount: number; commentCount: number }>>(
        `/api/public/post/stats?ids=${encodeURIComponent(param)}`,
        { method: 'GET', silent: true }
      );
    },

    getStatsById: (id: number) => {
      return fetchClient<{ id: number; viewCount: number; likeCount: number; commentCount: number }>(
        `/api/public/post/${id}/stats`,
        { method: 'GET', silent: true }
      );
    },
  },
};
