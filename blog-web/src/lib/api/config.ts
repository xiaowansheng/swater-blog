import { fetchClient } from './client';
import type { PublicConfigVO } from '@/types';

/**
 * 获取前台所有网站配置（已过滤敏感信息）
 * 包含：网站信息、作者信息、封面配置、社交链接、隐私设置、评论设置
 */
export async function getPublicConfig(): Promise<PublicConfigVO> {
  return fetchClient<PublicConfigVO>('/api/public/config');
}
