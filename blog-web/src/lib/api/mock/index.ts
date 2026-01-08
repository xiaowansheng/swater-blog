import articleData from './article.json';
import commentData from './comment.json';
import categoryData from './category.json';
import tagData from './tag.json';
import guestbookData from './guestbook.json';
import momentData from './moment.json';
import friendLinkData from './friendLink.json';
import searchData from './search.json';
import archiveData from './archive.json';
import type { ApiResponse } from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

interface MockHandler {
  pattern: RegExp;
  handler: (url: string, options?: RequestInit) => any;
}

const mockHandlers: MockHandler[] = [
  {
    pattern: /^\/api\/public\/post\/list/,
    handler: (url) => {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const page = parseInt(params.get('page') || '1');
      const size = parseInt(params.get('size') || '10');
      const categoryId = params.get('categoryId');
      const tagId = params.get('tagId');
      const keyword = params.get('keyword');
      
      let records = [...articleData.list];
      
      if (categoryId) {
        records = records.filter(p => p.categoryId === parseInt(categoryId));
      }
      if (tagId) {
        records = records.filter(p => p.tagIds?.includes(parseInt(tagId)));
      }
      if (keyword) {
        records = records.filter(p => 
          p.title.includes(keyword) || p.content.includes(keyword)
        );
      }
      
      const total = records.length;
      const start = (page - 1) * size;
      const end = start + size;
      
      return {
        records: records.slice(start, end),
        total,
        size,
        current: page,
        pages: Math.ceil(total / size),
      };
    },
  },
  {
    pattern: /^\/api\/public\/post\/slug\/(.+)/,
    handler: (url) => {
      const match = url.match(/\/api\/public\/post\/slug\/(.+)/);
      const slug = match?.[1];
      return articleData.list.find(p => p.slug === slug) || articleData.list[0];
    },
  },
  {
    pattern: /^\/api\/public\/post\/(\d+)/,
    handler: (url) => {
      const match = url.match(/\/api\/public\/post\/(\d+)/);
      const id = parseInt(match?.[1] || '0');
      return articleData.list.find(p => p.id === id) || articleData.list[0];
    },
  },
  {
    pattern: /^\/api\/public\/post\/hot/,
    handler: () => articleData.hot,
  },
  {
    pattern: /^\/api\/public\/post\/latest/,
    handler: () => articleData.latest,
  },
  {
    pattern: /^\/api\/public\/comment\/list/,
    handler: (url) => {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const page = parseInt(params.get('page') || '1');
      const size = parseInt(params.get('size') || '10');
      const postId = params.get('postId');
      const momentId = params.get('momentId');
      
      let records = [...commentData.list];
      
      if (postId) {
        records = records.filter(c => c.postId === parseInt(postId));
      }
      if (momentId) {
        records = records.filter(c => c.momentId === parseInt(momentId));
      }
      
      const total = records.length;
      const start = (page - 1) * size;
      const end = start + size;
      
      return {
        records: records.slice(start, end),
        total,
        size,
        current: page,
        pages: Math.ceil(total / size),
      };
    },
  },
  {
    pattern: /^\/api\/public\/comment$/,
    handler: (url, options) => {
      if (options?.method === 'POST') {
        const body = JSON.parse(options.body as string);
        return {
          id: Date.now(),
          ...body,
          status: 1,
          createTime: new Date().toISOString(),
        };
      }
      return null;
    },
  },
  {
    pattern: /^\/api\/public\/category\/list/,
    handler: () => categoryData.list,
  },
  {
    pattern: /^\/api\/public\/category\/(\d+)/,
    handler: (url) => {
      const match = url.match(/\/api\/public\/category\/(\d+)/);
      const id = parseInt(match?.[1] || '0');
      return categoryData.list.find(c => c.id === id) || categoryData.list[0];
    },
  },
  {
    pattern: /^\/api\/public\/tag\/list/,
    handler: () => tagData.list,
  },
  {
    pattern: /^\/api\/public\/tag\/(\d+)/,
    handler: (url) => {
      const match = url.match(/\/api\/public\/tag\/(\d+)/);
      const id = parseInt(match?.[1] || '0');
      return tagData.list.find(t => t.id === id) || tagData.list[0];
    },
  },
  {
    pattern: /^\/api\/public\/guestbook\/list/,
    handler: (url) => {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const page = parseInt(params.get('page') || '1');
      const size = parseInt(params.get('size') || '10');
      
      const total = guestbookData.list.length;
      const start = (page - 1) * size;
      const end = start + size;
      
      return {
        records: guestbookData.list.slice(start, end),
        total,
        size,
        current: page,
        pages: Math.ceil(total / size),
      };
    },
  },
  {
    pattern: /^\/api\/public\/guestbook$/,
    handler: (url, options) => {
      if (options?.method === 'POST') {
        const body = JSON.parse(options.body as string);
        return {
          id: Date.now(),
          ...body,
          status: 1,
          createTime: new Date().toISOString(),
        };
      }
      return null;
    },
  },
  {
    pattern: /^\/api\/public\/message\/email-code$/,
    handler: (url, options) => {
      if (options?.method === 'POST') {
        return { success: true };
      }
      return null;
    },
  },
  {
    pattern: /^\/api\/public\/moment\/list/,
    handler: (url) => {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const page = parseInt(params.get('page') || '1');
      const size = parseInt(params.get('size') || '10');
      
      const total = momentData.list.length;
      const start = (page - 1) * size;
      const end = start + size;
      
      return {
        records: momentData.list.slice(start, end),
        total,
        size,
        current: page,
        pages: Math.ceil(total / size),
      };
    },
  },
  {
    pattern: /^\/api\/public\/moment\/(\d+)/,
    handler: (url) => {
      const match = url.match(/\/api\/public\/moment\/(\d+)/);
      const id = parseInt(match?.[1] || '0');
      return momentData.list.find(m => m.id === id) || momentData.list[0];
    },
  },
  {
    pattern: /^\/api\/public\/friend-link\/list/,
    handler: () => friendLinkData.list,
  },
  {
    pattern: /^\/api\/public\/search/,
    handler: (url) => {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const keyword = params.get('keyword') || '';
      const page = parseInt(params.get('page') || '1');
      const size = parseInt(params.get('size') || '10');
      const type = params.get('type');
      
      let records = searchData.list.filter(s => 
        s.title.includes(keyword) || s.content.includes(keyword)
      );
      
      if (type) {
        records = records.filter(s => s.type === type);
      }
      
      const total = records.length;
      const start = (page - 1) * size;
      const end = start + size;
      
      return {
        records: records.slice(start, end),
        total,
        size,
        current: page,
        pages: Math.ceil(total / size),
      };
    },
  },
  {
    pattern: /^\/api\/public\/archive\/list/,
    handler: () => archiveData.list,
  },
  {
    pattern: /^\/api\/public\/archive\/(\d+)\/(\d+)/,
    handler: (url) => {
      const match = url.match(/\/api\/public\/archive\/(\d+)\/(\d+)/);
      const year = parseInt(match?.[1] || '0');
      const month = parseInt(match?.[2] || '0');
      const params = new URLSearchParams(url.split('?')[1] || '');
      const page = parseInt(params.get('page') || '1');
      const size = parseInt(params.get('size') || '10');
      
      const records = articleData.list.filter(p => {
        const date = new Date(p.publishedAt || p.createTime);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      });
      
      const total = records.length;
      const start = (page - 1) * size;
      const end = start + size;
      
      return {
        records: records.slice(start, end),
        total,
        size,
        current: page,
        pages: Math.ceil(total / size),
      };
    },
  },
];

export function getMockResponse<T>(url: string, options?: RequestInit): T | null {
  if (!USE_MOCK) {
    return null;
  }
  
  for (const handler of mockHandlers) {
    if (handler.pattern.test(url)) {
      const data = handler.handler(url, options);
      return data as T;
    }
  }
  
  return null;
}

export function createMockResponse<T>(data: T): Response {
  const response: ApiResponse<T> = {
    code: 200,
    message: 'success',
    data,
    timestamp: new Date().toISOString(),
  };
  
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

