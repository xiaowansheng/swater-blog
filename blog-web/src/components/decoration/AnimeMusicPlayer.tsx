'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicStore, Song } from '@/lib/store/musicStore';
import Image from 'next/image';

export default function AnimeMusicPlayer() {
  const {
    playlist,
    currentSong,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    isPlayerOpen,
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

  // 初始化默认播放列表
  useEffect(() => {
    if (playlist.length === 0) {
      const defaultSongs: Song[] = [
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
      ];

      useMusicStore.getState().setPlaylist(defaultSongs);
    }
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPlayModeIcon = () => {
    switch (playMode) {
      case 'sequential':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h5l.5 2.5L8 11H3l-1 4h12l-1-4H9l-1.5-4.5L8 4h5m4 0v6m0 0v6m0-6h6" />
          </svg>
        );
      case 'shuffle':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h5l2.5 2.5L11 11H6l-1 4h12l-1-4h-3m-2-6.5L11 11l2.5 2.5M4 20h5l2.5-2.5L11 13H6l-1-4h12l-1 4h-3m-2 6.5L11 13l2.5-2.5" />
          </svg>
        );
      case 'repeat':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
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

      {/* 浮动按钮 */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={togglePlayer}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg shadow-pink-500/30 flex items-center justify-center cursor-pointer border-2 border-white/20 backdrop-blur-sm"
      >
        {isPlaying ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="flex items-center gap-0.5"
          >
            <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-white rounded-full animate-pulse delay-75" />
            <span className="w-1 h-3 bg-white rounded-full animate-pulse delay-150" />
          </motion.div>
        ) : (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </motion.button>

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
              className="fixed bottom-40 right-6 z-50 w-80 bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            >
              {/* 专辑封面和歌曲信息 */}
              <div className="relative p-6">
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20" />
                <div className="absolute top-4 right-4 w-20 h-20 bg-pink-400/30 rounded-full blur-2xl" />
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-blue-400/30 rounded-full blur-2xl" />

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
                      title="播放模式"
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
                      onClick={() => {
                        /* 可以打开播放列表弹窗 */
                      }}
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
      </AnimatePresence>
    </>
  );
}
