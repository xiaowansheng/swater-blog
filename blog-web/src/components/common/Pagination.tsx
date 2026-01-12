'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/lib/i18n/routing';

interface PaginationProps {
  current: number;
  total: number;
  basePath: string;
  totalCount?: number;
  pageSize?: number;
}

export default function Pagination({ current, total, basePath, totalCount, pageSize = 10 }: PaginationProps) {
  const router = useRouter();
  const [jumpInput, setJumpInput] = useState('');
  const [isJumpFocused, setIsJumpFocused] = useState(false);

  const pages = Array.from({ length: total }, (_, i) => i + 1);

  // 显示的页码范围（当前页前后各2页）
  const getVisiblePages = () => {
    if (total <= 7) {
      return pages;
    }

    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    if (current <= 3) {
      end = Math.min(5, total);
    } else if (current >= total - 2) {
      start = Math.max(total - 4, 1);
    }

    const visible = [];
    if (start > 1) {
      visible.push(1);
      if (start > 2) visible.push('...');
    }
    for (let i = start; i <= end; i++) {
      visible.push(i);
    }
    if (end < total) {
      if (end < total - 1) visible.push('...');
      visible.push(total);
    }

    return visible;
  };

  const handleJump = () => {
    const page = parseInt(jumpInput);
    if (page >= 1 && page <= total) {
      router.push(`${basePath}?page=${page}`);
      setJumpInput('');
      setIsJumpFocused(false);

      // 滚动到内容区域顶部
      setTimeout(() => {
        const articlesElement = document.getElementById('articles');
        if (articlesElement) {
          articlesElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // 页码切换时滚动到顶部
  const handlePageClick = (e: React.MouseEvent) => {
    // 不阻止默认行为，让 Link 正常导航
    setTimeout(() => {
      const articlesElement = document.getElementById('articles');
      if (articlesElement) {
        articlesElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="flex flex-col items-center gap-6 mt-16">
      {/* 统计信息 */}
      {totalCount !== undefined && (
        <div className="text-sm text-muted-foreground">
          共 <span className="font-semibold text-primary">{totalCount}</span> 篇文章，
          当前第 <span className="font-semibold text-primary">{current}</span> / {total} 页
        </div>
      )}

      {/* 分页按钮 */}
      <div className="flex justify-center items-center gap-2">
        {/* 上一页 */}
        {current > 1 && (
          <Link
            href={`${basePath}?page=${current - 1}`}
            onClick={handlePageClick}
            className="px-4 py-2.5 border border-border rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary/50 transition-all flex items-center gap-2 font-medium hover:scale-105 active:scale-95 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">上一页</span>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </Link>
        )}

        {/* 页码按钮 */}
        <div className="flex gap-2">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-4 py-2.5 text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            return (
              <Link
                key={pageNum}
                href={`${basePath}?page=${pageNum}`}
                onClick={handlePageClick}
                className={`px-4 py-2.5 min-w-[2.75rem] text-center border rounded-xl transition-all font-medium relative overflow-hidden group ${
                  pageNum === current
                    ? 'bg-gradient-to-r from-primary to-accent text-white border-transparent shadow-lg shadow-primary/30 scale-110'
                    : 'border-border hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary/50 hover:scale-105 active:scale-95'
                }`}
              >
                <span className="relative z-10">{pageNum}</span>
                {pageNum !== current && (
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* 下一页 */}
        {current < total && (
          <Link
            href={`${basePath}?page=${current + 1}`}
            onClick={handlePageClick}
            className="px-4 py-2.5 border border-border rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary/50 transition-all flex items-center gap-2 font-medium hover:scale-105 active:scale-95 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="hidden sm:inline">下一页</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </Link>
        )}
      </div>

      {/* 跳转输入框 */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">跳转到</span>
        <div className="relative flex items-center">
          <input
            type="number"
            min={1}
            max={total}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsJumpFocused(true)}
            onBlur={() => {
              setTimeout(() => {
                if (!jumpInput) {
                  setIsJumpFocused(false);
                }
              }, 200);
            }}
            placeholder={current.toString()}
            className={`w-20 px-3 py-2 pr-10 border rounded-lg text-center transition-all ${
              isJumpFocused
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
          />
          {isJumpFocused && (
            <button
              onClick={handleJump}
              className="absolute right-2 px-2 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              GO
            </button>
          )}
        </div>
        <span className="text-muted-foreground">页</span>
      </div>
    </nav>
  );
}

