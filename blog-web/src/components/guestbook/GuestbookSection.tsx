'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import GuestbookList from './GuestbookList';
import GuestbookForm from './GuestbookForm';
import { guestbookApi } from '@/lib/api/guestbook';
import type { GuestbookVO } from '@/types';

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
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative">
        <div className="relative rounded-[26px] border border-primary/15 bg-card/70 p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 text-primary">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15l4 4 12-12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">{tGuestbook('messageList')}</h3>
            <span className="rounded-full border border-primary/15 bg-card/80 px-3 py-1 text-xs text-primary/70">
              {messages.length} {tGuestbook('messageCount')}
            </span>
          </div>
          {messages.length > 0 ? (
            <GuestbookList messages={messages} />
          ) : (
            <div className="overflow-hidden relative p-8 sm:p-12 md:p-16 text-center modern-card">
              <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
              <div className="relative z-10">
                <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br rounded-2xl from-primary/20 to-accent/20">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{t('noGuestbook')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{t('noGuestbookHint')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="sticky top-20">
          <div className="relative rounded-[28px] border border-primary/20 bg-gradient-to-br from-card via-secondary/30 to-primary/10 p-6 shadow-[0_28px_60px_-45px_rgba(244,114,182,0.55)]">
            <div className="absolute -top-8 right-8 h-16 w-16 rounded-full bg-deco-pink/30 blur-2xl"></div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 text-primary">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4 0 1.38.7 2.6 1.77 3.33L12 20l2.23-4.67A4 4 0 0016 12c0-2.21-1.79-4-4-4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{tGuestbook('writeMessage')}</h3>
                <p className="text-sm text-muted-foreground">{tGuestbook('messageHint')}</p>
              </div>
            </div>
            <GuestbookForm onSuccess={refreshMessages} />
            <div className="mt-6 rounded-[20px] border border-accent/15 bg-card/70 px-5 py-4 text-sm text-muted-foreground shadow-sm">
              <p className="font-semibold text-foreground/80">{tGuestbook('tips')}</p>
              <p className="mt-2 leading-relaxed">{tGuestbook('tipsContent')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
