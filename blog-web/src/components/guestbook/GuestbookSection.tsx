'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import GuestbookList from './GuestbookList';
import GuestbookForm from './GuestbookForm';
import { guestbookApi } from '@/lib/api/guestbook';
import type { GuestbookVO } from '@/types';
import { Card } from '@/components/ui/Card';

interface GuestbookSectionProps {
  initialMessages: GuestbookVO[];
  total: number;
  currentPage: number;
  pageSize: number;
  sort: string;
}

export default function GuestbookSection({
  initialMessages,
  total,
  currentPage,
  pageSize,
  sort,
}: GuestbookSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');
  const tGuestbook = useTranslations('guestbook');
  
  // 使用 Key 来强制重置组件状态，或者使用 useEffect 保持数据同步
  const [messages, setMessages] = useState<GuestbookVO[]>(initialMessages);
  
  // 当初始消息变化时同步更新（如翻页）
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.set('page', '1'); // 切换排序重置到第一页
    router.push(`${pathname}?${params.toString()}`);
  };

  const refreshMessages = async () => {
    try {
      // 提交成功后重新获取服务器数据（包括总数等）
      router.refresh();
      
      // 如果已在第一页，本地也刷一下（router.refresh 可能有延迟）
      if (currentPage === 1) {
        const result = await guestbookApi.getListClient(1, pageSize, sort);
        setMessages(result.records || []);
      } else {
        // 如果在其他页，跳转回第一页
        handlePageChange(1);
      }
    } catch (error) {
      console.error('Failed to refresh guestbook:', error);
    }
  };

  return (
    <div className="space-y-12">
      {/* 顶部输入区域 */}
      <section className="relative z-20 -mt-6">
         <GuestbookForm onSuccess={refreshMessages} />
      </section>

      {/* 留言列表区域 - 全宽瀑布流 */}
      <section className="relative min-h-[500px]">
        <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                </span>
                {tGuestbook('messageList')}
                 <span className="text-sm font-normal text-muted-foreground ml-2 px-3 py-1 rounded-full bg-secondary/50 border border-secondary">
                    {tGuestbook('total', { count: total })}
                </span>
            </h2>

            <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-xl border border-primary/5">
                <button
                    onClick={() => handleSortChange('desc')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        sort === 'desc' 
                        ? 'bg-white dark:bg-card text-primary shadow-sm ring-1 ring-primary/10' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-card/50'
                    }`}
                >
                    {tGuestbook('latest')}
                </button>
                <button
                    onClick={() => handleSortChange('asc')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        sort === 'asc' 
                        ? 'bg-white dark:bg-card text-primary shadow-sm ring-1 ring-primary/10' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-card/50'
                    }`}
                >
                    {tGuestbook('oldest')}
                </button>
            </div>
        </div>

        {messages.length > 0 ? (
          <div className="relative">
             <GuestbookList messages={messages} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-colors duration-500"></div>
                <div className="relative bg-card/50 backdrop-blur-sm p-8 rounded-full border-2 border-dashed border-primary/20 group-hover:scale-105 transition-transform duration-500">
                    <svg
                      className="h-16 w-16 text-primary/40 group-hover:text-primary/60 transition-colors duration-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                </div>
            </div>
            <h3 className="mt-4 text-xl font-bold text-foreground">{tGuestbook('noGuestbook')}</h3>
            <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
              {tGuestbook('noGuestbookHint')}
            </p>
          </div>
        )}
      </section>
      
      {/* 分页 */}
       {totalPages > 1 && (
        <div className="flex justify-center pt-8 pb-4">
            <div className="inline-flex items-center gap-1 p-1 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-full border border-primary/10 shadow-sm">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-3 rounded-full hover:bg-primary/10 text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                aria-label="Previous page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              
              <span className="px-6 py-2 text-sm font-bold tabular-nums tracking-wider text-foreground">
                <span className="text-primary">{currentPage}</span>
                <span className="mx-2 text-muted-foreground/40">/</span>
                <span className="text-muted-foreground">{totalPages}</span>
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-3 rounded-full hover:bg-primary/10 text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                aria-label="Next page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
        </div>
      )}
    </div>
  );
}
