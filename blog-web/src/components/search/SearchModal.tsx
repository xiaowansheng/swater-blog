'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { searchApi } from '@/lib/api/search';
import type { SearchVO } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchType = 'all' | 'post' | 'moment' | 'comment';

const SEARCH_HISTORY_KEY = 'swater_search_history';
const MAX_HISTORY_COUNT = 10;

function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((k) => typeof k === 'string') : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(keyword: string) {
  if (typeof window === 'undefined' || !keyword.trim()) return;
  const history = getSearchHistory().filter((k) => k !== keyword);
  history.unshift(keyword);
  if (history.length > MAX_HISTORY_COUNT) history.length = MAX_HISTORY_COUNT;
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

function removeSearchHistory(keyword: string) {
  const history = getSearchHistory().filter((k) => k !== keyword);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

function clearSearchHistory() {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}

function buildResultUrl(result: SearchVO): string {
  if (result.type === 'post') {
    return `/post/${result.articleKey || result.id}`;
  }
  if (result.type === 'moment') {
    return `/moment/${result.articleKey || result.id}`;
  }
  if (result.type === 'comment') {
    const targetTypeLower = (result.targetType || '').toLowerCase();
    if (targetTypeLower.includes('article') || targetTypeLower.includes('post')) {
      return `/post/${result.articleKey || result.targetId}`;
    }
    if (targetTypeLower.includes('moment') || targetTypeLower.includes('talk')) {
      return `/moment/${result.articleKey || result.targetId}`;
    }
  }
  return '#';
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [results, setResults] = useState<SearchVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSearchHistory(getSearchHistory());
    }
  }, [isOpen]);

  const handleResultClick = useCallback((result: SearchVO) => {
    const url = buildResultUrl(result);
    if (url === '#') return;
    saveSearchHistory(keyword.trim());
    router.push(url);
    onClose();
    setKeyword('');
    setResults([]);
  }, [keyword, router, onClose]);

  const handleHistoryClick = useCallback((term: string) => {
    saveSearchHistory(term);
    setKeyword(term);
    setSearchType('all');
    inputRef.current?.focus();
  }, []);

  const handleRemoveHistory = useCallback((term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSearchHistory(term);
    setSearchHistory(getSearchHistory());
  }, []);

  const handleClearHistory = useCallback(() => {
    clearSearchHistory();
    setSearchHistory([]);
  }, []);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // 禁止页面滚动
      document.body.style.overflow = 'hidden';
    } else if (!isOpen) {
      // 恢复页面滚动
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // ESC 关闭弹窗
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleResultClick]);

  // 搜索功能
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (keyword.trim().length >= 2) {
        setLoading(true);
        try {
          const data = await searchApi.search({
            keyword: keyword.trim(),
            type: searchType === 'all' ? undefined : searchType,
            page: 1,
            size: 8,
          });
          setResults(data.records);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('搜索失败:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [keyword, searchType]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post':
        return '文章';
      case 'moment':
        return '说说';
      case 'comment':
        return '评论';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'moment':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'comment':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 - 覆盖整个屏幕 */}
          <div
            className="fixed left-0 right-0 top-0 bottom-0 w-screen h-screen z-[9999] bg-black/50"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* 搜索弹窗容器 */}
          <div
            className="fixed left-0 right-0 top-0 bottom-0 w-screen h-screen z-[10000] flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-3 sm:px-4"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-3xl pointer-events-auto"
            >
            <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden">
              {/* 搜索头部 */}
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-5 border-b border-border/50">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={t('placeholder')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-muted/50 border border-border/50 rounded-lg text-sm sm:text-base outline-none focus:border-primary/50 focus:bg-background transition-all placeholder:text-muted-foreground"
                  />
                  {keyword && (
                    <button
                      onClick={() => {
                        setKeyword('');
                        setResults([]);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 rounded-md hover:bg-muted transition-colors"
                      title="清空"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors"
                  title="关闭 (ESC)"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 搜索类型筛选 */}
              <div className="flex gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border/50 bg-muted/30">
                {[
                  { value: 'all', label: '全部', icon: '🔍' },
                  { value: 'post', label: '文章', icon: '📝' },
                  { value: 'moment', label: '说说', icon: '💬' },
                  { value: 'comment', label: '评论', icon: '💭' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSearchType(type.value as SearchType)}
                    className={`flex items-center justify-center gap-1 sm:gap-1.5 flex-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      searchType === type.value
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <span className="text-sm sm:text-base">{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>

              {/* 搜索结果 */}
              <div className="max-h-[45vh] sm:max-h-[50vh] overflow-y-auto">
                {keyword.length < 2 ? (
                  <div className="py-4 px-3 sm:px-5">
                    {/* Search History */}
                    {searchHistory.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">🕐</span>
                            <h3 className="text-sm font-semibold text-foreground">{t('history')}</h3>
                          </div>
                          <button
                            onClick={handleClearHistory}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {t('clearHistory')}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {searchHistory.map((term) => (
                            <div key={term} className="group relative">
                              <button
                                onClick={() => handleHistoryClick(term)}
                                className="px-3 py-1.5 text-xs sm:text-sm rounded-full bg-muted/30 hover:bg-primary/10 hover:text-primary border border-border/20 hover:border-primary/30 transition-all duration-200 pr-7"
                              >
                                {term}
                              </button>
                              <button
                                onClick={(e) => handleRemoveHistory(term, e)}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-60 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-muted-foreground/20 flex items-center justify-center transition-all"
                                title="删除"
                              >
                                <svg className="w-2.5 h-2.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-xs text-muted-foreground/60">{t('noHistory')}</p>
                        <p className="text-xs text-muted-foreground/50 mt-1.5">输入至少 2 个字符开始搜索</p>
                      </div>
                    )}
                  </div>
                ) : loading ? (
                  <div className="py-12 sm:py-16 text-center px-4">
                    <div className="inline-block w-9 h-9 sm:w-10 sm:h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
                    <p className="text-sm sm:text-base text-muted-foreground">搜索中...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 sm:px-5 py-2 text-xs text-muted-foreground border-b border-border/30">
                      找到 {results.length} 条结果
                    </div>
                    {results.map((result, index) => {
                      const url = buildResultUrl(result);

                      return (
                        <motion.a
                          key={result.id}
                          href={url}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleResultClick(result);
                          }}
                          className={`flex gap-2 sm:gap-3 items-start p-3 sm:p-4 mx-2 sm:mx-3 my-1 sm:my-1.5 rounded-xl transition-all duration-200 ${
                            index === selectedIndex
                              ? 'bg-accent/80 shadow-md'
                              : 'hover:bg-accent/40'
                          }`}
                        >
                          <div className={`flex-shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold border ${getTypeColor(result.type)}`}>
                            {getTypeLabel(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1 sm:mb-1.5 truncate text-xs sm:text-sm">{result.title || '无标题'}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {result.content || result.excerpt}
                            </p>
                          </div>
                          <div className="flex-shrink-0 hidden sm:block">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </motion.a>
                      );
                    })}
                    {results.length >= 8 && (
                      <a
                        href={`/search?keyword=${encodeURIComponent(keyword)}&type=${searchType}`}
                        onClick={(e) => {
                          e.preventDefault();
                          saveSearchHistory(keyword.trim());
                          onClose();
                          setKeyword('');
                          setResults([]);
                          router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}&type=${searchType}`);
                        }}
                        className="block mx-2 sm:mx-3 my-2 p-2.5 sm:p-3 text-center text-xs sm:text-sm font-medium text-primary hover:underline rounded-xl hover:bg-accent/40 transition-colors"
                      >
                        查看全部结果 →
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="py-12 sm:py-16 text-center px-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-muted/50 mb-3 sm:mb-4">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground font-medium">未找到相关结果</p>
                    <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">试试其他关键词</p>
                  </div>
                )}
              </div>

              {/* 底部提示 - 仅在桌面端显示键盘快捷键 */}
              <div className="hidden sm:flex items-center justify-between px-5 py-3 border-t border-border/50 bg-muted/20">
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 rounded-md bg-background border border-border font-sans">↑↓</kbd>
                    <span>导航</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 rounded-md bg-background border border-border font-sans">↵</kbd>
                    <span>打开</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 rounded-md bg-background border border-border font-sans">ESC</kbd>
                    <span>关闭</span>
                  </span>
                </div>
                <div className="text-xs text-muted-foreground/70">
                  由 AI 驱动的全站搜索
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
