import { create } from 'zustand';

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  url: string;
  duration?: number;
}

interface MusicStore {
  // 播放列表
  playlist: Song[];
  currentSong: Song | null;
  currentIndex: number;

  // 播放状态
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isPlayerOpen: boolean;

  // 播放模式
  playMode: 'sequential' | 'shuffle' | 'repeat';

  // Actions
  setPlaylist: (songs: Song[]) => void;
  addToPlaylist: (song: Song) => void;
  removeFromPlaylist: (songId: string) => void;
  playSong: (song: Song) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  togglePlayer: () => void;
  setPlayMode: (mode: 'sequential' | 'shuffle' | 'repeat') => void;
  seekTo: (time: number) => void;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  // 初始状态
  playlist: [],
  currentSong: null,
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  volume: 0.7,
  isMuted: false,
  isPlayerOpen: false,
  playMode: 'sequential',

  // 设置播放列表
  setPlaylist: (songs) =>
    set({
      playlist: songs,
      currentSong: songs.length > 0 ? songs[0] : null,
      currentIndex: songs.length > 0 ? 0 : -1,
      currentTime: 0,
    }),

  // 添加歌曲到播放列表
  addToPlaylist: (song) =>
    set((state) => ({
      playlist: [...state.playlist, song],
    })),

  // 从播放列表移除歌曲
  removeFromPlaylist: (songId) =>
    set((state) => {
      const newPlaylist = state.playlist.filter((s) => s.id !== songId);
      const currentIndex = state.playlist.findIndex((s) => s.id === songId);

      // 如果删除的是当前播放的歌曲
      if (currentIndex === state.currentIndex) {
        return {
          playlist: newPlaylist,
          currentSong: newPlaylist.length > 0 ? newPlaylist[0] : null,
          currentIndex: 0,
          isPlaying: false,
          currentTime: 0,
        };
      }

      return {
        playlist: newPlaylist,
        currentIndex:
          currentIndex < state.currentIndex
            ? state.currentIndex - 1
            : state.currentIndex,
      };
    }),

  // 播放指定歌曲
  playSong: (song) =>
    set({
      currentSong: song,
      currentIndex: get().playlist.findIndex((s) => s.id === song.id),
      isPlaying: true,
      currentTime: 0,
    }),

  // 下一曲
  playNext: () => {
    const { playlist, currentIndex, playMode } = get();
    if (playlist.length === 0) return;

    let nextIndex = currentIndex;

    if (playMode === 'shuffle') {
      // 随机播放
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else if (playMode === 'repeat') {
      // 单曲循环，保持当前索引
      nextIndex = currentIndex;
    } else {
      // 顺序播放
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    set({
      currentSong: playlist[nextIndex],
      currentIndex: nextIndex,
      currentTime: 0,
      isPlaying: true,
    });
  },

  // 上一曲
  playPrevious: () => {
    const { playlist, currentIndex } = get();
    if (playlist.length === 0) return;

    const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;

    set({
      currentSong: playlist[prevIndex],
      currentIndex: prevIndex,
      currentTime: 0,
      isPlaying: true,
    });
  },

  // 切换播放/暂停
  togglePlay: () =>
    set((state) => ({
      isPlaying: !state.isPlaying,
    })),

  // 设置当前播放时间
  setCurrentTime: (time) =>
    set({
      currentTime: time,
    }),

  // 设置音量
  setVolume: (volume) =>
    set({
      volume,
      isMuted: volume === 0,
    }),

  // 切换静音
  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
    })),

  // 切换播放器打开/关闭
  togglePlayer: () =>
    set((state) => ({
      isPlayerOpen: !state.isPlayerOpen,
    })),

  // 设置播放模式
  setPlayMode: (mode) =>
    set({
      playMode: mode,
    }),

  // 跳转到指定时间
  seekTo: (time) =>
    set({
      currentTime: time,
    }),
}));
