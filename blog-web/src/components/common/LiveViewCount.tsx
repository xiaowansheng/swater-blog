'use client';

import { useEffect, useState } from 'react';
import { articleApi } from '@/lib/api/article';
import { momentApi } from '@/lib/api/moment';

type ViewType = 'ARTICLE' | 'TALK';

export default function LiveViewCount({
  type,
  id,
  initialCount,
}: {
  type: ViewType;
  id: number;
  initialCount: number;
}) {
  const [count, setCount] = useState<number>(initialCount);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const latest =
          type === 'ARTICLE'
            ? await articleApi.client.getViewCount(id)
            : await momentApi.client.getViewCount(id);
        if (cancelled) return;
        setCount(latest);
        if (latest === initialCount) {
          setTimeout(load, 1200);
        }
      } catch {
        // ignore
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [type, id, initialCount]);

  return <>{count.toLocaleString()}</>;
}

