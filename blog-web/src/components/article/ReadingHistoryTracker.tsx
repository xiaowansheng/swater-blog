'use client';

import { useEffect } from 'react';
import { addToReadingHistory } from '@/components/home/ContinueReading';
import type { PostVO } from '@/types';

interface ReadingHistoryTrackerProps {
  article: PostVO;
}

export default function ReadingHistoryTracker({ article }: ReadingHistoryTrackerProps) {
  useEffect(() => {
    addToReadingHistory({
      id: article.id,
      title: article.title,
      slug: article.articleKey || article.slug || String(article.id),
      cover: article.cover,
      categoryName: article.categoryName,
    });
  }, [article]);

  return null;
}
