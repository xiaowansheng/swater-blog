'use client';

import { Link } from '@/lib/i18n/routing';

interface PaginationProps {
  current: number;
  total: number;
  basePath: string;
}

export default function Pagination({ current, total, basePath }: PaginationProps) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <nav className="flex justify-center items-center gap-2 mt-16">
      {current > 1 && (
        <Link
          href={`${basePath}?page=${current - 1}`}
          className="px-5 py-2.5 border border-border rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary/50 transition-all flex items-center gap-2 font-medium hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            上一页
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </Link>
      )}
      <div className="flex gap-2">
        {pages.map((page) => (
          <Link
            key={page}
            href={`${basePath}?page=${page}`}
            className={`px-4 py-2.5 min-w-[2.75rem] text-center border rounded-xl transition-all font-medium relative overflow-hidden group ${
              page === current
                ? 'bg-gradient-to-r from-primary to-accent text-white border-transparent shadow-lg shadow-primary/30 scale-110'
                : 'border-border hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary/50 hover:scale-105 active:scale-95'
            }`}
          >
            <span className="relative z-10">{page}</span>
            {page !== current && (
              <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            )}
          </Link>
        ))}
      </div>
      {current < total && (
        <Link
          href={`${basePath}?page=${current + 1}`}
          className="px-5 py-2.5 border border-border rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary/50 transition-all flex items-center gap-2 font-medium hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center gap-2">
            下一页
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </Link>
      )}
    </nav>
  );
}

