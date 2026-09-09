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
  handler: (url: string, options?: RequestInit) => unknown;
}

interface MockComment {
  id: number;
  postId?: number;
  momentId?: number;
  parentId?: number;
  nickname: string;
  email?: string;
  avatar?: string;
  content: string;
  status: number;
  createTime: string;
  children?: MockComment[];
  replyToUser?: { nickname: string };
  replyCount?: number;
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
      const post = articleData.list.find(p => p.slug === slug || p.articleKey === slug);
      // 不兜底：未命中时抛错，让页面走 notFound() 404 路径，与真实后端行为一致
      if (!post) throw new Error(`Mock: post not found by slug: ${slug}`);
      return post;
    },
  },
  {
    pattern: /^\/api\/public\/post\/key\/(.+)/,
    handler: (url) => {
      const match = url.match(/\/api\/public\/post\/key\/(.+)/);
      const key = match?.[1];
      const post = articleData.list.find(p => p.articleKey === key || p.slug === key || p.id.toString() === key);
      if (!post) throw new Error(`Mock: post not found by key: ${key}`);
      return post;
    },
  },
  {
    pattern: /^\/api\/public\/post\/(\d+)\/related/,
    handler: (url) => {
      const match = url.match(/\/api\/public\/post\/(\d+)\/related/);
      const id = parseInt(match?.[1] || '0');
      return articleData.list.filter(p => p.id !== id).slice(0, 6);
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
      const parentIdParam = params.get('parentId');
      const targetId = params.get('targetId');
      const targetType = params.get('targetType');
      const order = params.get('order');

      const comments = commentData.list as unknown as MockComment[];
      const flatRecords: MockComment[] = comments.flatMap((c) => {
        const top = { ...c, replyCount: c.children?.length || 0 };
        const children = (c.children || []).map(child => ({
          ...child,
          replyToUser: { nickname: c.nickname },
        }));
        Reflect.deleteProperty(top, 'children');
        return [top, ...children];
      });

      let records = [...flatRecords];

      if (targetId && targetType === 'ARTICLE') {
        records = records.filter((c) => c.postId === parseInt(targetId));
      }
      if (targetId && targetType === 'TALK') {
        records = records.filter((c) => c.momentId === parseInt(targetId));
      }

      if (parentIdParam !== null) {
        const parentId = parseInt(parentIdParam);
        if (parentId === 0) {
          records = records.filter((c) => !c.parentId);
          records.sort((a, b) => {
            const diff = new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
            return order === 'asc' ? diff : -diff;
          });
        } else {
          records = records.filter((c) => c.parentId === parentId);
          records.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());
        }
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
          replyCount: 0,
          likeCount: 0,
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
  {
    pattern: /^\/api\/public\/config$/,
    handler: () => mockPublicConfig,
  },
  {
    pattern: /^\/api\/public\/statistics\/total$/,
    handler: () => ({ pv: 123456, uv: 23456 }),
  },
  {
    pattern: /^\/api\/public\/about$/,
    handler: () => ({
      content:
        '## 关于本站\n\n这是 mock 模式下的关于页面内容。配置 `NEXT_PUBLIC_USE_MOCK=true` 后无需后端即可预览全站。',
    }),
  },
  {
    pattern: /^\/api\/public\/track\/enter$/,
    handler: (url, options) => {
      if (options?.method !== 'POST') return null;
      const body = JSON.parse(options.body as string);
      const uuid = body.visitorUuid || `mock-visitor-${Math.random().toString(36).slice(2, 10)}`;
      return {
        visitorUuid: uuid,
        sessionId: `mock-session-${Math.random().toString(36).slice(2, 10)}`,
        newVisitor: !body.visitorUuid,
        newSession: true,
        pagePvCounted: true,
        contentReadCounted: false,
      };
    },
  },
  {
    pattern: /^\/api\/public\/like\/status/,
    handler: () => ({ liked: false, likeCount: 0 }),
  },
  {
    pattern: /^\/api\/public\/like$/,
    handler: (url, options) => {
      if (options?.method !== 'POST') return null;
      const body = JSON.parse(options.body as string);
      // 无状态 mock：不做跨请求计数，仅保证点赞/取消动作有正确结构的响应
      return {
        visitorUuid: body.visitorUuid || 'mock-visitor',
        liked: body.action !== 'UNLIKE',
        likeCount: body.action === 'UNLIKE' ? 0 : 1,
      };
    },
  },
];

// 站点公共配置的 mock 值，结构与 config.server.ts 的 defaultConfig（PublicConfigVO）一致
const mockPublicConfig = {
  site: {
    name: 'Swater Blog',
    description: '一个现代化的博客平台（Mock 模式）',
    keywords: '博客,前端,技术分享',
    logo: '/favicon.svg',
    favicon: '/favicon.svg',
    createTime: '2024-01-01',
    icp: '',
    police: '',
    copyright: '© 2024 Swater',
    notice: '当前为 Mock 演示模式，数据均为本地模拟。',
  },
  author: {
    name: 'Swater',
    avatar: 'http://localhost:8888/uploads/avatar.png',
    signature: '代码即诗',
    introduction: '一名喜欢折腾前端的开发者。',
  },
  cover: {
    home: 'http://localhost:8888/uploads/cover-home.jpg',
    article: 'http://localhost:8888/uploads/cover-article.jpg',
    archive: 'http://localhost:8888/uploads/cover-archive.jpg',
    category: 'http://localhost:8888/uploads/cover-category.jpg',
    tag: 'http://localhost:8888/uploads/cover-tag.jpg',
    talk: 'http://localhost:8888/uploads/cover-talk.jpg',
    album: 'http://localhost:8888/uploads/cover-album.jpg',
    link: 'http://localhost:8888/uploads/cover-link.jpg',
    about: 'http://localhost:8888/uploads/cover-about.jpg',
    message: 'http://localhost:8888/uploads/cover-message.jpg',
    default: 'http://localhost:8888/uploads/cover-default.jpg',
  },
  social: {
    github: 'https://github.com/example',
  },
  privacy: {
    showIp: false,
    showLocation: true,
    showDevice: false,
    showBrowser: false,
  },
  comment: {
    allowAnonymous: false,
    allowGuest: true,
  },
  component: {
    articleCommentEnabled: true,
    talkCommentEnabled: true,
    guestbookMessageEnabled: true,
  },
  reward: {
    rewardEnabled: true,
  },
};

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

