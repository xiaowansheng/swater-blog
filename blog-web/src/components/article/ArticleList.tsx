'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import ArticleCard from './ArticleCard';
import type { PostVO } from '@/types';
import { articleApi } from '@/lib/api/article';

interface ArticleListProps {
  articles: PostVO[];
  variant?: 'list' | 'card';
}

export default function ArticleList({ articles, variant }: ArticleListProps) {
  const [statsById, setStatsById] = useState<
    Record<number, { viewCount: number; likeCount: number; commentCount: number }>
  >({});
  const ids = useMemo(() => (articles || []).map(a => a.id).filter(Boolean), [articles]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!ids.length) return;
      try {
        const stats = await articleApi.client.getStats(ids);
        if (cancelled) return;
        const next: Record<number, { viewCount: number; likeCount: number; commentCount: number }> = {};
        for (const item of stats) {
          next[item.id] = {
            viewCount: item.viewCount,
            likeCount: item.likeCount,
            commentCount: item.commentCount,
          };
        }
        setStatsById(next);
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (!articles || !Array.isArray(articles)) {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-500 py-8">暂无文章数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article, index) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <ArticleCard
            article={statsById[article.id] ? ({ ...article, ...statsById[article.id] } as PostVO) : article}
            variant={variant}
          />
        </motion.div>
      ))}
    </div>
  );
}

