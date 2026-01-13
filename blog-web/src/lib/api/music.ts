import { MusicConfig } from '@/types';
import { musicConfig as defaultMusicConfig } from '@/lib/constants/music';

/**
 * 获取音乐播放器配置
 * 优先从 public/config/music.json 读取，失败则使用默认配置
 */
export async function getMusicConfig(): Promise<MusicConfig> {
  try {
    const response = await fetch('/config/music.json', {
      cache: 'no-store', // 不使用缓存，确保每次都读取最新配置
    });

    if (!response.ok) {
      throw new Error('Failed to load music config');
    }

    const config = await response.json();

    // 验证配置格式
    if (!config.defaultPlaylist || !Array.isArray(config.defaultPlaylist)) {
      throw new Error('Invalid music config format');
    }

    return config as MusicConfig;
  } catch (error) {
    console.warn('Failed to load music config from file, using default config:', error);
    return defaultMusicConfig;
  }
}

/**
 * 服务端获取音乐配置（带React缓存）
 * 用于Server Components
 */
export async function getServerMusicConfig(): Promise<MusicConfig> {
  return getMusicConfig();
}
