import ArticleListSkeleton from '@/components/article/ArticleListSkeleton';

export default function Loading() {
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <ArticleListSkeleton />
        </div>
        {/* Sidebar skeleton placeholder - optional, or just hide */}
        <div className="hidden lg:block w-80 shrink-0 space-y-6">
             <div className="h-64 bg-black/5 dark:bg-white/5 rounded-3xl animate-pulse"/>
             <div className="h-64 bg-black/5 dark:bg-white/5 rounded-3xl animate-pulse"/>
        </div>
      </div>
    </div>
  );
}
