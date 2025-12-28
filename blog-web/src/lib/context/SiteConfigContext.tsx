'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { PublicConfigVO, SiteInfo, AuthorInfo, CoverConfig, SocialConfig, PrivacyConfig, CommentConfig } from '@/types';
import { getPublicConfig } from '@/lib/api/config';

// 默认配置
const defaultSiteInfo: SiteInfo = {
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
};

const defaultAuthorInfo: AuthorInfo = {
  name: '',
  avatar: '',
  signature: '',
  introduction: '',
};

const defaultCoverConfig: CoverConfig = {
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
};

const defaultSocialConfig: SocialConfig = {};

const defaultPrivacyConfig: PrivacyConfig = {
  showIp: false,
  showLocation: true,
  showDevice: false,
  showBrowser: false,
};

const defaultCommentConfig: CommentConfig = {
  allowAnonymous: false,
  allowGuest: true,
  pageSize: 10,
};

interface SiteConfigContextType {
  site: SiteInfo;
  author: AuthorInfo;
  cover: CoverConfig;
  social: SocialConfig;
  privacy: PrivacyConfig;
  comment: CommentConfig;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType>({
  site: defaultSiteInfo,
  author: defaultAuthorInfo,
  cover: defaultCoverConfig,
  social: defaultSocialConfig,
  privacy: defaultPrivacyConfig,
  comment: defaultCommentConfig,
  loading: true,
  error: null,
  refresh: async () => {},
});

export function SiteConfigProvider({ 
  children,
  initialConfig,
}: { 
  children: React.ReactNode;
  initialConfig?: PublicConfigVO;
}) {
  const [site, setSite] = useState<SiteInfo>(initialConfig?.site || defaultSiteInfo);
  const [author, setAuthor] = useState<AuthorInfo>(initialConfig?.author || defaultAuthorInfo);
  const [cover, setCover] = useState<CoverConfig>(initialConfig?.cover || defaultCoverConfig);
  const [social, setSocial] = useState<SocialConfig>(initialConfig?.social || defaultSocialConfig);
  const [privacy, setPrivacy] = useState<PrivacyConfig>(initialConfig?.privacy || defaultPrivacyConfig);
  const [comment, setComment] = useState<CommentConfig>(initialConfig?.comment || defaultCommentConfig);
  const [loading, setLoading] = useState(!initialConfig);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = await getPublicConfig();
      setSite(config.site || defaultSiteInfo);
      setAuthor(config.author || defaultAuthorInfo);
      setCover(config.cover || defaultCoverConfig);
      setSocial(config.social || defaultSocialConfig);
      setPrivacy(config.privacy || defaultPrivacyConfig);
      setComment(config.comment || defaultCommentConfig);
    } catch (err) {
      console.error('Failed to load site config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialConfig) {
      loadConfig();
    }
  }, [initialConfig]);

  return (
    <SiteConfigContext.Provider
      value={{
        site,
        author,
        cover,
        social,
        privacy,
        comment,
        loading,
        error,
        refresh: loadConfig,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

/**
 * 使用网站配置的Hook
 * @example
 * const { site, author, cover, privacy, comment } = useSiteConfig();
 * console.log(site.name);           // 网站名称
 * console.log(author.avatar);       // 作者头像
 * console.log(cover.home);          // 首页封面
 * console.log(privacy.showLocation); // 是否显示位置
 * console.log(comment.allowGuest);  // 是否允许游客评论
 */
export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}

export default SiteConfigContext;
