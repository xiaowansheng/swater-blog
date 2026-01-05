'use client';

import { motion } from 'framer-motion';
import ArticleCard from './ArticleCard';
import type { PostVO } from '@/types';

interface ArticleListProps {
  articles: PostVO[];
  variant?: 'list' | 'card';
}

export default function ArticleList({ articles, variant }: ArticleListProps) {
  // 添加空值检查
  if (!articles || !Array.isArray(articles)) {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-500 py-8">
          暂无文章数据
        </div>
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
          <ArticleCard article={article} variant={variant} />
        </motion.div>
      ))}
    </div>
  );
}

