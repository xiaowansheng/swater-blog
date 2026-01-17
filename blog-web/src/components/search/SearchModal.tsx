'use client';

import { useState, useEffect, useRef } from 'react';
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

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [results, setResults] = useState<SearchVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
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
        const result = results[selectedIndex];

        // 在前端生成URL
        let url = '#';
        if (result.type === 'post') {
          url = `/post/${result.articleKey || result.id}`;
        } else if (result.type === 'moment') {
          url = `/moment/${result.articleKey || result.id}`;
        } else if (result.type === 'comment') {
          // 对于评论，后端已经在articleKey字段中返回了目标文章/说说的key
          if (result.targetType === 'article' || result.targetType === 'post') {
            url = `/post/${result.articleKey || result.targetId}`;
          } else if (result.targetType === 'moment' || result.targetType === 'talk') {
            url = `/moment/${result.articleKey || result.targetId}`;
          }
        }

        router.push(url);
        onClose();
        setKeyword('');
        setResults([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, router, onClose]);

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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* 搜索弹窗 */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-3xl overflow-hidden shadow-2xl"
          >
            <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden">
              {/* 搜索头部 */}
              <div className="flex items-center gap-3 p-5 border-b border-border/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border/50 rounded-lg text-base outline-none focus:border-primary/50 focus:bg-background transition-all placeholder:text-muted-foreground"
                  />
                  {keyword && (
                    <button
                      onClick={() => {
                        setKeyword('');
                        setResults([]);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted transition-colors"
                      title="清空"
                    >
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="关闭 (ESC)"
                >
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 搜索类型筛选 */}
              <div className="flex gap-2 px-5 py-3 border-b border-border/50 bg-muted/30">
                {[
                  { value: 'all', label: '全部', icon: '🔍' },
                  { value: 'post', label: '文章', icon: '📝' },
                  { value: 'moment', label: '说说', icon: '💬' },
                  { value: 'comment', label: '评论', icon: '💭' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSearchType(type.value as SearchType)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      searchType === type.value
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>

              {/* 搜索结果 */}
              <div className="max-h-[50vh] overflow-y-auto">
                {keyword.length < 2 ? (
                  <div className="py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
                      <svg className="w-8 h-8 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground">输入至少 2 个字符开始搜索</p>
                  </div>
                ) : loading ? (
                  <div className="py-16 text-center">
                    <div className="inline-block w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-muted-foreground">搜索中...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    <div className="px-5 py-2 text-xs text-muted-foreground border-b border-border/30">
                      找到 {results.length} 条结果
                    </div>
                    {results.map((result, index) => {
                      // 在前端生成URL
                      const getUrl = (result: SearchVO) => {
                        if (result.type === 'post') {
                          return `/post/${result.articleKey || result.id}`;
                        } else if (result.type === 'moment') {
                          return `/moment/${result.articleKey || result.id}`;
                        } else if (result.type === 'comment') {
                          // 对于评论，后端已经在articleKey字段中返回了目标文章/说说的key
                          console.log('=== 评论详细信息 ===');
                          console.log('完整数据:', JSON.stringify(result, null, 2));
                          console.log('targetType:', result.targetType);
                          console.log('targetType类型:', typeof result.targetType);
                          console.log('articleKey:', result.articleKey);
                          console.log('targetId:', result.targetId);

                          if (!result.targetType) {
                            console.log('❌ targetType 为空或未定义');
                            return '#';
                          }

                          const targetTypeLower = result.targetType.toLowerCase();
                          console.log('targetType转小写:', targetTypeLower);

                          if (targetTypeLower.includes('article') || targetTypeLower.includes('post')) {
                            const url = `/post/${result.articleKey || result.targetId}`;
                            console.log('✅ 文章URL:', url);
                            return url;
                          } else if (targetTypeLower.includes('moment') || targetTypeLower.includes('talk')) {
                            const url = `/moment/${result.articleKey || result.targetId}`;
                            console.log('✅ 说说URL:', url);
                            return url;
                          }
                          console.log('❌ 评论类型不匹配，返回#');
                          return '#';
                        }
                        return '#';
                      };

                      const url = getUrl(result);
                      console.log('最终URL:', url, '类型:', result.type);

                      return (
                        <motion.a
                          key={result.id}
                          href={url}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            onClose();
                            setKeyword('');
                            setResults([]);
                          }}
                          className={`flex gap-3 items-start p-4 mx-3 my-1.5 rounded-xl transition-all duration-200 ${
                            index === selectedIndex
                              ? 'bg-accent/80 shadow-md'
                              : 'hover:bg-accent/40'
                          }`}
                        >
                          <div className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getTypeColor(result.type)}`}>
                            {getTypeLabel(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1.5 truncate text-sm">{result.title || '无标题'}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {result.content || result.excerpt}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
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
                        onClick={() => {
                          onClose();
                          setKeyword('');
                          setResults([]);
                        }}
                        className="block mx-3 my-2 p-3 text-center text-sm font-medium text-primary hover:underline rounded-xl hover:bg-accent/40 transition-colors"
                      >
                        查看全部结果 →
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-4">
                      <svg className="w-8 h-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground font-medium">未找到相关结果</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">试试其他关键词</p>
                  </div>
                )}
              </div>

              {/* 底部提示 */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border/50 bg-muted/20">
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
      )}
    </AnimatePresence>
  );
}
