'use client';

import { Card } from '@/components/ui/Card';

export default function ArticleListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-5 sm:p-6 md:p-8" hoverEffect={false}>
          <div className="animate-pulse flex flex-col gap-4">
            {/* Title */}
            <div className="h-8 bg-black/5 dark:bg-white/5 rounded-lg w-3/4" />
            
            {/* Meta info */}
            <div className="flex gap-3">
              <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-20" />
              <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-20" />
            </div>

            {/* Content preview */}
            <div className="space-y-2">
              <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-full" />
              <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-full" />
              <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-2/3" />
            </div>

            {/* Tags */}
            <div className="flex gap-2 mt-2">
              <div className="h-6 bg-black/5 dark:bg-white/5 rounded-full w-16" />
              <div className="h-6 bg-black/5 dark:bg-white/5 rounded-full w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
