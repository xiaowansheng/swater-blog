import { MusicConfig } from '@/types';
import { musicConfig as defaultMusicConfig } from '@/lib/constants/music';

// 缓存相关常量
const MUSIC_CACHE_KEY = 'music-config';
const MUSIC_CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存

interface CacheData {
  config: MusicConfig;
  timestamp: number;
}

/**
 * 从 localStorage 读取缓存的音乐配置
 */
function getCachedMusicConfig(): MusicConfig | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(MUSIC_CACHE_KEY);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    const now = Date.now();

    // 检查缓存是否过期
    if (now - data.timestamp > MUSIC_CACHE_DURATION) {
      localStorage.removeItem(MUSIC_CACHE_KEY);
      return null;
    }

    return data.config;
  } catch (error) {
    console.warn('Failed to read cached music config:', error);
    return null;
  }
}

/**
 * 将音乐配置写入 localStorage 缓存
 */
function setCachedMusicConfig(config: MusicConfig): void {
  if (typeof window === 'undefined') return;

  try {
    const data: CacheData = {
      config,
      timestamp: Date.now(),
    };
    localStorage.setItem(MUSIC_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache music config:', error);
  }
}

/**
 * 获取音乐播放器配置
 * 优先从缓存读取，缓存过期或不存在时从服务器获取
 */
export async function getMusicConfig(): Promise<MusicConfig> {
  // 尝试从缓存读取
  const cached = getCachedMusicConfig();
  if (cached) {
    console.log('Using cached music config');
    return cached;
  }

  try {
    const response = await fetch('/config/music.json', {
      cache: 'no-store', // 不使用浏览器缓存，使用我们自己的缓存机制
    });

    if (!response.ok) {
      throw new Error('Failed to load music config');
    }

    const config = await response.json();

    // 验证配置格式
    if (!config.defaultPlaylist || !Array.isArray(config.defaultPlaylist)) {
      throw new Error('Invalid music config format');
    }

    const validConfig = config as MusicConfig;

    // 写入缓存
    setCachedMusicConfig(validConfig);

    return validConfig;
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

/**
 * 清除音乐配置缓存
 * 用于配置更新后强制刷新
 */
export function clearMusicConfigCache(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(MUSIC_CACHE_KEY);
    console.log('Music config cache cleared');
  } catch (error) {
    console.warn('Failed to clear music config cache:', error);
  }
}
