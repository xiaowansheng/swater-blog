import { fetchServer } from './server';
import type { PublicConfigVO, SiteInfo, AuthorInfo, CoverConfig, SocialConfig, PrivacyConfig, CommentConfig } from '@/types';
import { cache } from 'react';

// 默认配置（API调用失败时使用）
const defaultConfig: PublicConfigVO = {
  site: {
    name: 'Blog',
    description: '',
    keywords: '',
    logo: '',
    favicon: '',
    createTime: '',
    icp: '',
    police: '',
    copyright: '',
    notice: '',
  },
  author: {
    name: '',
    avatar: '',
    signature: '',
    introduction: '',
  },
  cover: {
    home: '',
    article: '',
    archive: '',
    category: '',
    tag: '',
    talk: '',
    album: '',
    link: '',
    about: '',
    message: '',
    default: '',
  },
  social: {},
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
};

/**
 * 服务端获取配置（带React缓存，同一请求周期内只调用一次API）
 * 用于Server Components
 */
export const getServerConfig = cache(async (): Promise<PublicConfigVO> => {
  try {
    return await fetchServer<PublicConfigVO>('/api/public/config');
  } catch (error) {
    console.warn('Failed to load site config from server:', error);
    return defaultConfig;
  }
});

/**
 * 获取网站信息
 */
export const getSiteInfo = cache(async (): Promise<SiteInfo> => {
  const config = await getServerConfig();
  return config.site;
});

/**
 * 获取作者信息
 */
export const getAuthorInfo = cache(async (): Promise<AuthorInfo> => {
  const config = await getServerConfig();
  return config.author;
});

/**
 * 获取封面配置
 */
export const getCoverConfig = cache(async (): Promise<CoverConfig> => {
  const config = await getServerConfig();
  return config.cover;
});

/**
 * 获取社交链接
 */
export const getSocialConfig = cache(async (): Promise<SocialConfig> => {
  const config = await getServerConfig();
  return config.social;
});

/**
 * 获取隐私配置
 */
export const getPrivacyConfig = cache(async (): Promise<PrivacyConfig> => {
  const config = await getServerConfig();
  return config.privacy;
});

/**
 * 获取评论配置
 */
export const getCommentConfig = cache(async (): Promise<CommentConfig> => {
  const config = await getServerConfig();
  return config.comment;
});
