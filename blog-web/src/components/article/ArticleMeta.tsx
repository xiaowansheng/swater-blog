'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatDate } from '@/lib/utils/format';
import { usePathname, Link } from '@/lib/i18n/routing';
import type { PostVO } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface ArticleMetaProps {
  article: PostVO;
}

export default function ArticleMeta({ article }: ArticleMetaProps) {
  const t = useTranslations('common');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(article.likeCount || 0);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleLike = () => {
    if (liked) return;
    setLiked(true);
    setLikes(prev => prev + 1);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1000);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center pb-6 mb-8 text-sm border-b text-muted border-border/40">
      {/* ... existing fields ... */}
      {article.authorName && (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {article.authorName}
        </span>
      )}
      {article.publishedAt && (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(article.publishedAt, 'YYYY-MM-DD HH:mm', locale)}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {article.viewCount}
      </span>
      
      {/* Interactive Like Button */}
      <button 
        onClick={handleLike}
        disabled={liked}
        className={`flex items-center gap-1.5 transition-all relative ${liked ? 'text-deco-pink scale-110' : 'hover:text-deco-pink hover:scale-105'}`}
      >
        <motion.span
          animate={liked ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <svg className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.span>
        {likes}
        
        {/* Cute Particle Effect (Confetti) */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ 
                    opacity: 1, 
                    x: 0, 
                    y: 0, 
                    scale: 0,
                    rotate: 0 
                  }}
                  animate={{ 
                    opacity: [1, 1, 0], 
                    x: (Math.random() - 0.5) * 100, 
                    y: (Math.random() - 0.8) * 80,
                    scale: [0, 1.2, 0.5],
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: 0.8, 
                    ease: "easeOut",
                    delay: Math.random() * 0.1
                  }}
                  className={`absolute left-1/2 top-1/2 w-2 h-2 rounded-sm ${
                    i % 3 === 0 ? 'bg-deco-pink' : i % 3 === 1 ? 'bg-deco-yellow' : 'bg-primary'
                  }`}
                  style={{
                    clipPath: i % 2 === 0 ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none', // Star or Square
                    borderRadius: i % 2 === 0 ? '0' : '50%'
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </button>

      {article.commentCount > 0 && (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {article.commentCount}
        </span>
      )}
      {article.categoryName && article.categoryKey && (
        <Link
          href={`/category/${article.categoryKey}`}
          className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
        >
          {article.categoryName}
        </Link>
      )}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.tagKey}`}
              className="px-3 py-1 text-xs font-medium rounded-full transition-colors bg-secondary hover:bg-primary/10 hover:text-primary"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

