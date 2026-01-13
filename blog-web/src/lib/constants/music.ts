import { Song } from '@/lib/store/musicStore';

/**
 * 音乐播放器配置
 */
export interface MusicConfig {
  /** 默认播放列表 */
  defaultPlaylist: Song[];
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 默认音量 0-1 */
  defaultVolume?: number;
  /** 默认播放模式 */
  defaultPlayMode?: 'sequential' | 'shuffle' | 'repeat';
}

/**
 * 音乐播放器默认配置
 *
 * 可以在这里添加你想要的歌曲
 * 每首歌曲需要包含：
 * - id: 唯一标识
 * - title: 歌曲标题
 * - artist: 艺术家
 * - url: 音频文件地址
 * - cover: 专辑封面地址（可选）
 * - duration: 歌曲时长（可选）
 */
export const musicConfig: MusicConfig = {
  defaultPlaylist: [
    {
      id: '1',
      title: '樱花树下的约定',
      artist: 'ACG音乐',
      url: 'https://music.163.com/song/media/outer/url?id=1397105803.mp3',
      cover: 'https://picsum.photos/seed/sakura/300/300',
    },
    {
      id: '2',
      title: '穿越时空的思念',
      artist: '犬夜叉ED',
      url: 'https://music.163.com/song/media/outer/url?id=1387581250.mp3',
      cover: 'https://picsum.photos/seed/time/300/300',
    },
    {
      id: '3',
      title: '千本樱',
      artist: '钢琴版',
      url: 'https://music.163.com/song/media/outer/url?id=1387593479.mp3',
      cover: 'https://picsum.photos/seed/cherry/300/300',
    },
  ],
  autoPlay: false,
  defaultVolume: 0.7,
  defaultPlayMode: 'sequential',
};
