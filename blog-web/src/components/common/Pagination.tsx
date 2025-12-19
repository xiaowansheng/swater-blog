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
    <nav className="flex justify-center gap-2 mt-8">
      {current > 1 && (
        <Link
          href={`${basePath}?page=${current - 1}`}
          className="px-4 py-2 border rounded hover:bg-foreground/10"
        >
          Previous
        </Link>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={`${basePath}?page=${page}`}
          className={`px-4 py-2 border rounded ${
            page === current
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-foreground/10'
          }`}
        >
          {page}
        </Link>
      ))}
      {current < total && (
        <Link
          href={`${basePath}?page=${current + 1}`}
          className="px-4 py-2 border rounded hover:bg-foreground/10"
        >
          Next
        </Link>
      )}
    </nav>
  );
}

