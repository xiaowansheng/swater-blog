'use client';

import { motion } from 'framer-motion';
import ArticleCard from './ArticleCard';
import type { PostVO } from '@/types';

interface ArticleListProps {
  articles: PostVO[];
  variant?: 'list' | 'card';
}

export default function ArticleList({ articles, variant }: ArticleListProps) {
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

