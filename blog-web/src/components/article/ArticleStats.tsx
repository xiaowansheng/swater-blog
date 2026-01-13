'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { PostVO } from '@/types';

interface ArticleStatsProps {
  article: PostVO;
}

export default function ArticleStats({ article }: ArticleStatsProps) {
  const t = useTranslations('common');
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(article.likeCount || 0);

  const handleLike = () => {
    if (liked) return;
    setLiked(true);
    setLikes(prev => prev + 1);
  };

  const stats = [
    {
      label: t('wordCount'),
      value: article.content?.length || 0,
      icon: '📝',
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      borderColor: 'border-blue-200/50 dark:border-blue-700/50'
    },
    {
      label: t('read'),
      value: article.viewCount || 0,
      icon: '👀',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      borderColor: 'border-green-200/50 dark:border-green-700/50'
    },
    {
      label: t('like'),
      value: likes,
      icon: '❤️',
      color: 'from-pink-400 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      borderColor: 'border-pink-200/50 dark:border-pink-700/50',
      interactive: true,
      onClick: handleLike,
      isActive: liked
    },
    {
      label: t('comment'),
      value: article.commentCount || 0,
      icon: '💬',
      color: 'from-purple-400 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      borderColor: 'border-purple-200/50 dark:border-purple-700/50'
    }
  ];

  return (
    <div className="mt-8 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`
              relative p-4 rounded-xl border transition-all duration-300 cursor-pointer
              bg-gradient-to-br ${stat.bgColor} ${stat.borderColor}
              ${stat.interactive ? 'hover:shadow-lg hover:scale-105' : 'hover:shadow-md hover:scale-102'}
              ${stat.isActive ? 'ring-2 ring-pink-400/50 shadow-lg' : ''}
            `}
            onClick={stat.onClick}
            whileHover={{ y: -2 }}
            whileTap={stat.interactive ? { scale: 0.95 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* 装饰性背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />

            {/* 内容 */}
            <div className="relative text-center">
              {/* 图标 */}
              <motion.div
                className="text-2xl mb-2"
                animate={stat.isActive ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                {stat.icon}
              </motion.div>

              {/* 数值 */}
              <motion.div
                className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}
                animate={stat.isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {stat.value.toLocaleString()}
              </motion.div>

              {/* 标签 */}
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>

            {/* 点赞特效 */}
            {stat.interactive && stat.isActive && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-pink-400 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{
                      scale: 0,
                      x: 0,
                      y: 0,
                      opacity: 1
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos(i * 45 * Math.PI / 180) * 30,
                      y: Math.sin(i * 45 * Math.PI / 180) * 30,
                      opacity: [1, 1, 0]
                    }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            )}

            {/* 悬停光晕 */}
            <div className={`
              absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
              bg-gradient-to-r ${stat.color} blur-xl -z-10
            `} style={{ filter: 'blur(20px)' }} />
          </motion.div>
        ))}
      </div>

      {/* 分享提示 */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-muted-foreground">
          {t('likeHint')}
          <motion.span
            className="inline-block ml-1"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ✨
          </motion.span>
        </p>
      </motion.div>
    </div>
  );
}