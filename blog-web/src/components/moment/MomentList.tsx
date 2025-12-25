'use client';

import type { MomentVO } from '@/types';
import MomentItem from './MomentItem';

interface MomentListProps {
  moments: MomentVO[];
}

export default function MomentList({ moments }: MomentListProps) {
  if (!moments || moments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        暂无说说
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {moments.map((moment) => (
        <MomentItem key={moment.id} moment={moment} />
      ))}
    </div>
  );
}

