'use client';

import { safeRandomUUID } from '@/lib/utils/uuid';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { likeApi, type LikeContentType } from '@/lib/api/like';
import { useTranslations } from 'next-intl';

function getOrCreateId(key: string, storage: Storage) {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const id = safeRandomUUID();
  storage.setItem(key, id);
  return id;
}

export default function ContentLikeButton({
  contentType,
  contentId,
  initialLikeCount = 0,
  className,
}: {
  contentType: LikeContentType;
  contentId: number;
  initialLikeCount?: number;
  className?: string;
}) {
  const t = useTranslations('common');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount || 0);
  const [dirty, setDirty] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  const visitorUuid = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getOrCreateId('visitor_uuid', window.localStorage);
  }, []);

  const localKey = useMemo(() => `liked:${contentType}:${contentId}`, [contentType, contentId]);

  useEffect(() => {
    if (dirty) return;
    setLikeCount(initialLikeCount || 0);
  }, [initialLikeCount, dirty]);

  useEffect(() => {
    if (!visitorUuid) return;

    const local = window.localStorage.getItem(localKey);
    if (local === '1') setLiked(true);

    likeApi
      .status({ visitorUuid, contentType, contentId })
      .then((res) => {
        setLiked(!!res?.liked);
        if (!dirty && typeof res?.likeCount === 'number') setLikeCount(res.likeCount);
        window.localStorage.setItem(localKey, res?.liked ? '1' : '0');
      })
      .catch(() => {});
  }, [visitorUuid, contentType, contentId, localKey, dirty]);

  async function setLike(nextLiked: boolean) {
    if (!visitorUuid) return;

    setDirty(true);
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await likeApi.action({
        visitorUuid,
        contentType,
        contentId,
        action: nextLiked ? 'LIKE' : 'UNLIKE',
      });
      setLiked(!!res?.liked);
      if (typeof res?.likeCount === 'number') setLikeCount(res.likeCount);
      window.localStorage.setItem(localKey, res?.liked ? '1' : '0');
      if (res?.visitorUuid && res.visitorUuid !== visitorUuid) {
        window.localStorage.setItem('visitor_uuid', res.visitorUuid);
      }
      if (res?.liked) {
        setShowHearts(true);
        setTimeout(() => setShowHearts(false), 1000);
      }
    } catch {
      setLiked((prev) => !prev);
      setLikeCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
    }
  }

  return (
    <div className={`flex justify-center my-8 ${className || ''}`}>
      <motion.div className="relative" whileHover={{ scale: 1.05 }}>
        <motion.button
          onClick={() => setLike(!liked)}
          className={`
            relative px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 overflow-hidden
            ${
              liked
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                : 'bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 text-pink-600 dark:text-pink-400 border-2 border-pink-200/50 dark:border-pink-700/50 hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-lg hover:shadow-pink-500/10'
            }
          `}
          whileTap={{ scale: 0.95 }}
          animate={
            liked
              ? {
                  boxShadow: [
                    '0 0 0 0 rgba(236, 72, 153, 0.4)',
                    '0 0 0 10px rgba(236, 72, 153, 0)',
                    '0 0 0 0 rgba(236, 72, 153, 0)',
                  ],
                }
              : {}
          }
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />

          <div className="relative flex items-center gap-3">
            <motion.div
              animate={
                liked
                  ? {
                      scale: [1, 1.3, 1],
                      rotate: [0, -10, 10, 0],
                    }
                  : {}
              }
              transition={{ duration: 0.5 }}
            >
              <svg
                className={`w-6 h-6 ${liked ? 'fill-current' : ''}`}
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </motion.div>

            <div className="flex items-center gap-2">
              <span>{liked ? t('liked') : t('likeButton')}</span>
              <motion.span
                className="font-bold"
                animate={liked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {likeCount.toLocaleString()}
              </motion.span>
            </div>
          </div>

          <motion.div
            className="absolute inset-0 bg-white/20 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 1.5, opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.4 }}
          />
        </motion.button>

        <AnimatePresence>
          {showHearts && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 text-pink-400"
                  style={{ left: '50%', top: '50%' }}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    scale: [0, 1, 0.5],
                    x: Math.cos((i * 30 * Math.PI) / 180) * (50 + Math.random() * 30),
                    y: Math.sin((i * 30 * Math.PI) / 180) * (50 + Math.random() * 30),
                    opacity: [1, 1, 0],
                    rotate: Math.random() * 360,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-pink-400/40 to-rose-400/40 rounded-full blur-sm"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}

