'use client';

import { motion } from 'framer-motion';
import { useMusicStore } from '@/lib/store/musicStore';

interface MusicPlayerButtonProps {
  scrolled?: boolean;
}

export default function MusicPlayerButton({ scrolled = false }: MusicPlayerButtonProps) {
  const { isPlaying, togglePlayer } = useMusicStore();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={togglePlayer}
      className={`min-h-[44px] min-w-[44px] p-2.5 rounded-full transition-all relative overflow-hidden group ${
        scrolled
          ? 'hover:bg-primary/10'
          : 'hover:bg-white/10 text-white'
      }`}
      title="音乐播放器"
    >
      {isPlaying ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="flex items-center gap-0.5"
        >
          <span className="w-1 h-3 bg-current rounded-full animate-pulse" />
          <span className="w-1 h-5 bg-current rounded-full animate-pulse delay-75" />
          <span className="w-1 h-3 bg-current rounded-full animate-pulse delay-150" />
        </motion.div>
      ) : (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
      <span className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100"></span>
    </motion.button>
  );
}
