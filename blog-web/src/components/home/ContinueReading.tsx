'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { getFullUrl } from '@/lib/utils/format';

interface HistoryItem {
  id: number;
  title: string;
  slug: string;
  cover?: string;
  categoryName?: string;
  readAt: number;
}

const STORAGE_KEY = 'reading_history';
const MAX_ITEMS = 20;

function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

export function addToReadingHistory(item: Omit<HistoryItem, 'readAt'>) {
  if (typeof window === 'undefined') return;
  try {
    const current = loadHistory();
    const filtered = current.filter((h) => h.id !== item.id);
    const next = [{ ...item, readAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

export function getReadingHistory(): HistoryItem[] {
  return loadHistory();
}

export default function ContinueReading() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [locale, setLocale] = useState('zh');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(loadHistory());
    const pathLocale = window.location.pathname.split('/')[1];
    if (pathLocale && /^[a-z]{2}$/.test(pathLocale)) {
      setLocale(pathLocale);
    }
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          继续阅读
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {history.slice(0, 8).map((item) => {
          const timeAgo = getTimeAgo(item.readAt);
          return (
            <Link
              key={item.id}
              href={`/${locale}/post/${item.slug || item.id}`}
              className="group flex-shrink-0 w-40"
            >
              <Card className="h-full overflow-hidden border border-border/50 transition-all duration-200">
                {item.cover ? (
                  <div className="h-20 overflow-hidden relative">
                    <Image
                      src={getFullUrl(item.cover)}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      sizes="160px"
                    />
                  </div>
                ) : (
                  <div className="h-20 bg-muted flex items-center justify-center">
                    <svg className="w-6 h-6 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                <div className="p-2.5">
                  <h4 className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  if (days < 365) return `${Math.floor(days / 30)} 月前`;
  return `${Math.floor(days / 365)} 年前`;
}
