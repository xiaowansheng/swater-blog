'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import GuestbookList from './GuestbookList';
import GuestbookForm from './GuestbookForm';
import { guestbookApi } from '@/lib/api/guestbook';
import type { GuestbookVO } from '@/types';
import { Card } from '@/components/ui/Card';

interface GuestbookSectionProps {
  initialMessages: GuestbookVO[];
  currentPage: number;
  pageSize: number;
}

export default function GuestbookSection({
  initialMessages,
  currentPage,
  pageSize,
}: GuestbookSectionProps) {
  const t = useTranslations('common');
  const tGuestbook = useTranslations('guestbook');
  const [messages, setMessages] = useState<GuestbookVO[]>(initialMessages);

  const refreshMessages = async () => {
    try {
      const result = await guestbookApi.getListClient(currentPage, pageSize);
      setMessages(result.records || []);
    } catch (error) {
      console.error('Failed to refresh guestbook:', error);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] items-start">
      <div className="relative min-h-[500px]">
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 text-primary shadow-sm">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">{tGuestbook('messageList')}</h3>
                    <p className="text-xs text-muted-foreground font-medium">Capture the moment</p>
                </div>
            </div>
            
             <span className="rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary shadow-sm">
                {messages.length} {tGuestbook('messageCount')}
            </span>
        </div>

        {messages.length > 0 ? (
          <GuestbookList messages={messages} />
        ) : (
          <div className="overflow-hidden relative p-8 sm:p-16 text-center rounded-[2.5rem] bg-white/40 dark:bg-black/20 border-2 border-dashed border-primary/10 backdrop-blur-sm">
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex justify-center items-center mb-6 w-24 h-24 bg-gradient-to-tr from-primary/10 to-accent/20 rounded-[2rem] shadow-inner rotate-3 hover:rotate-6 transition-transform">
                <svg className="w-10 h-10 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-foreground/80">{t('noGuestbook')}</h3>
              <p className="text-muted-foreground font-medium max-w-xs">{t('noGuestbookHint')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="relative order-first lg:order-last">
        <div className="sticky top-24">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/60 dark:bg-card/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-2">
             {/* 装饰背景 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/10 to-transparent -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-radial from-accent/10 to-transparent translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

            <div className="relative bg-white/50 dark:bg-black/20 rounded-[2rem] p-6 lg:p-7 backdrop-blur-sm">
                <div className="mb-8 flex items-center gap-4 relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30 transform -rotate-6">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground leading-tight">{tGuestbook('writeMessage')}</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-1 opacity-80">{tGuestbook('messageHint')}</p>
                </div>
                </div>
                
                <div className="relative z-10">
                    <GuestbookForm onSuccess={refreshMessages} />
                    
                    <div className="mt-6 rounded-2xl bg-primary/5 p-4 text-xs text-muted-foreground/80 leading-relaxed border border-primary/10">
                        <p className="font-bold text-primary mb-1 flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {tGuestbook('tips')}
                        </p>
                        {tGuestbook('tipsContent')}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
