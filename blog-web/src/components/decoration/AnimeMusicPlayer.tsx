'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicStore, Song } from '@/lib/store/musicStore';
import Image from 'next/image';
import { getMusicConfig } from '@/lib/api/music';
import { musicConfig as defaultMusicConfig } from '@/lib/constants/music';

export default function AnimeMusicPlayer() {
  const {
    playlist,
    currentSong,
    currentIndex,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    isPlayerOpen,
    isPlaylistOpen,
    playMode,
    playSong,
    playNext,
    playPrevious,
    togglePlay,
    setCurrentTime,
    setVolume,
    toggleMute,
    togglePlayer,
    setPlayMode,
    seekTo,
  } = useMusicStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const playlistPanelRef = useRef<HTMLDivElement>(null);
  const playerPanelRef = useRef<HTMLDivElement>(null);
  const initializingRef = useRef(false);
  const openPlaylist = () => useMusicStore.setState({ isPlaylistOpen: true });
  const closePlaylist = () => useMusicStore.setState({ isPlaylistOpen: false });

  // 初始化默认播放列表
  useEffect(() => {
    const initPlaylist = async () => {
      // 防止重复初始化
      if (initializingRef.current || playlist.length > 0) {
        return;
      }

      initializingRef.current = true;

      try {
        // 动态加载配置文件（现在带缓存）
        const musicConfig = await getMusicConfig();
        useMusicStore.getState().setPlaylist(musicConfig.defaultPlaylist);

        // 设置初始音量和播放模式
        if (musicConfig.defaultVolume !== undefined) {
          useMusicStore.getState().setVolume(musicConfig.defaultVolume);
        }
        if (musicConfig.defaultPlayMode) {
          useMusicStore.getState().setPlayMode(musicConfig.defaultPlayMode);
        }
      } catch (error) {
        console.error('Failed to load music config, using default:', error);
        // 使用硬编码的默认配置作为fallback
        useMusicStore.getState().setPlaylist(defaultMusicConfig.defaultPlaylist);
      } finally {
        initializingRef.current = false;
      }
    };

    initPlaylist();
  }, []);

  // 音频播放控制
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  // 更新当前播放时间
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      playNext();
    };

    const handleLoadedMetadata = () => {
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [playNext, isDragging]);

  // 更新音量
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // 跳转到指定时间
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const diff = Math.abs(audio.currentTime - currentTime);
    if (diff > 0.5 && !isDragging) {
      audio.currentTime = currentTime;
    }
  }, [currentTime, isDragging]);

  // 禁止/恢复页面滚动
  useEffect(() => {
    if (isPlayerOpen || isPlaylistOpen) {
      // 禁止滚动
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      // 恢复滚动
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // 组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isPlayerOpen, isPlaylistOpen]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPlayModeIcon = () => {
    switch (playMode) {
      case 'sequential':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
      case 'shuffle':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
          </svg>
        );
      case 'repeat':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPlayModeTitle = () => {
    switch (playMode) {
      case 'sequential':
        return '顺序播放';
      case 'shuffle':
        return '随机播放';
      case 'repeat':
        return '单曲循环';
      default:
        return '';
    }
  };

  return (
    <>
      {/* 隐藏的音频元素 */}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.url}
          onPlay={() => useMusicStore.setState({ isPlaying: true })}
          onPause={() => useMusicStore.setState({ isPlaying: false })}
        />
      )}

      {/* 主播放器 */}
      <AnimatePresence>
        {isPlayerOpen && currentSong && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={togglePlayer}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* 播放器卡片 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
              style={{
                width: Math.min(320, Math.max(200, window.innerWidth - 32)),
                maxHeight: Math.max(200, window.innerHeight - 32),
              }}
              ref={playerPanelRef}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            >
              {/* 专辑封面和歌曲信息 */}
              <div className="relative p-6">
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20" />
                <div className="absolute top-4 right-4 w-20 h-20 bg-pink-400/30 rounded-full blur-2xl" />
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-blue-400/30 rounded-full blur-2xl" />

                {/* 关闭按钮 */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayer}
                  className="absolute top-4 right-4 z-20 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title="关闭播放器"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                <div className="relative z-10">
                  {/* 专辑封面 */}
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div
                      animate={{ rotate: isPlaying ? 360 : 0 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-pink-400/50 shadow-lg flex-shrink-0"
                    >
                      <Image
                        src={currentSong.cover || 'https://picsum.photos/300/300'}
                        alt={currentSong.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                      {/* 中心圆点 */}
                      <div className="absolute inset-0 m-auto w-3 h-3 bg-white/80 rounded-full" />
                    </motion.div>

                    {/* 歌曲信息 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">
                        {currentSong.title}
                      </h3>
                      <p className="text-sm text-white/70 truncate">
                        {currentSong.artist}
                      </p>
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-4">
                    <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer group">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${audioRef.current ? (currentTime / audioRef.current.duration) * 100 : 0}%`,
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={audioRef.current?.duration || 100}
                        value={currentTime}
                        onChange={(e) => {
                          const time = parseFloat(e.target.value);
                          seekTo(time);
                          if (audioRef.current) {
                            audioRef.current.currentTime = time;
                          }
                        }}
                        onMouseDown={() => setIsDragging(true)}
                        onMouseUp={() => setIsDragging(false)}
                        onTouchStart={() => setIsDragging(true)}
                        onTouchEnd={() => setIsDragging(false)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/60 mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(audioRef.current?.duration || 0)}</span>
                    </div>
                  </div>

                  {/* 控制按钮 */}
                  <div className="flex items-center justify-between mb-4">
                    {/* 播放模式 */}
                    <button
                      onClick={() => {
                        const modes: Array<'sequential' | 'shuffle' | 'repeat'> = ['sequential', 'shuffle', 'repeat'];
                        const currentModeIndex = modes.indexOf(playMode);
                        const nextMode = modes[(currentModeIndex + 1) % modes.length];
                        setPlayMode(nextMode);
                      }}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                      title={getPlayModeTitle()}
                    >
                      {getPlayModeIcon()}
                    </button>

                    {/* 上一曲 */}
                    <button
                      onClick={playPrevious}
                      className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                      </svg>
                    </button>

                    {/* 播放/暂停 */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlay}
                      className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30"
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </motion.button>

                    {/* 下一曲 */}
                    <button
                      onClick={playNext}
                      className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                      </svg>
                    </button>

                    {/* 播放列表 */}
                    <button
                      onClick={() => (isPlaylistOpen ? closePlaylist() : openPlaylist())}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                      title="播放列表"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                  </div>

                  {/* 音量控制 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      )}
                    </button>
                    <div className="relative flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
                        animate={{ width: `${isMuted ? 0 : volume * 100}%` }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* 播放列表弹窗 */}
        <AnimatePresence>
          {isPlaylistOpen && (
            <>
              {/* 背景遮罩 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closePlaylist}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70]"
              />

              {/* 播放列表卡片 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25 }}
                style={{
                  width: Math.min(320, Math.max(200, window.innerWidth - 32)),
                  maxHeight: Math.max(200, window.innerHeight - 32),
                }}
                ref={playlistPanelRef}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
              >
                {/* 头部 */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">播放列表</h3>
                    <p className="text-sm text-white/60">{playlist.length} 首歌曲</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closePlaylist}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* 歌曲列表 */}
                <div className="overflow-y-auto max-h-[50vh] p-2">
                  {playlist.map((song, index) => (
                    <motion.button
                      key={song.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        playSong(song);
                        if (!isPlayerOpen) {
                          togglePlayer();
                        }
                      }}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                        currentIndex === index
                          ? 'bg-gradient-to-r from-pink-400/30 to-purple-500/30 border border-pink-400/30'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      {/* 序号/播放指示 */}
                      <div className="relative w-8 h-8 flex-shrink-0">
                        {currentIndex === index && isPlaying ? (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="flex items-center gap-0.5"
                          >
                            <span className="w-0.5 h-3 bg-pink-400 rounded-full animate-pulse" />
                            <span className="w-0.5 h-5 bg-pink-400 rounded-full animate-pulse delay-75" />
                            <span className="w-0.5 h-3 bg-pink-400 rounded-full animate-pulse delay-150" />
                          </motion.div>
                        ) : (
                          <span className={`text-sm font-medium ${
                            currentIndex === index ? 'text-pink-400' : 'text-white/60'
                          }`}>
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* 专辑封面 */}
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={song.cover || 'https://picsum.photos/300/300'}
                          alt={song.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>

                      {/* 歌曲信息 */}
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-sm font-medium truncate ${
                          currentIndex === index ? 'text-pink-400' : 'text-white'
                        }`}>
                          {song.title}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                          {song.artist}
                        </p>
                      </div>

                      {/* 当前播放指示 */}
                      {currentIndex === index && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0"
                        />
                      )}
                    </motion.button>
                  ))}

                  {playlist.length === 0 && (
                    <div className="py-12 text-center text-white/60">
                      <p>播放列表为空</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </>
  );
}
