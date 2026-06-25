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
    return fetchServer<PageResult<PostVO>>(
      `/api/public/post/list?${searchParams.toString()}`,
      { next: { tags: ['article:list'] } }
    );
  },

  getById: (id: number) => {
    return fetchServer<PostVO>(`/api/public/post/${id}`, {
      next: { tags: [`article:detail:id:${id}`] },
    });
  },

  getBySlug: (slug: string) => {
    return fetchServer<PostVO>(`/api/public/post/slug/${slug}`, {
      next: { tags: [`article:detail:slug:${slug}`] },
    });
  },

  getByKey: (key: string) => {
    return fetchServer<PostVO>(`/api/public/post/key/${key}`, {
      next: { tags: [`article:detail:key:${key}`] },
    });
  },

  getHot: (limit: number = 10) => {
    return fetchServer<PostVO[]>(
      `/api/public/post/hot?limit=${limit}`,
      { next: { tags: ['article:hot'] } }
    );
  },

  getLatest: (limit: number = 10) => {
    return fetchServer<PostVO[]>(
      `/api/public/post/latest?limit=${limit}`,
      { next: { tags: ['article:latest'] } }
    );
  },

  getRelated: (id: number, limit: number = 6) => {
    return fetchServer<PostVO[]>(
      `/api/public/post/${id}/related?limit=${limit}`,
      { next: { tags: [`article:related:${id}`] } }
    );
  },

  verifyPassword: (id: number, password: string) => {
    return fetchClient<{ token: string; article: PostVO }>(
      `/api/public/post/${id}/verify-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        // 密码错误属于预期内的业务结果，由组件内显示错误信息，不弹全局 toast
        silent: true,
      }
    );
  },

  /** 凭解锁 token 复用获取加密文章正文（token 失效返回 403） */
  getUnlockedContent: (id: number, token: string) => {
    return fetchClient<PostVO>(
      `/api/public/post/${id}/unlocked-content?token=${encodeURIComponent(token)}`,
      // token 过期属正常情况，静默失败后回退到密码输入，不弹 toast
      { silent: true }
    );
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
