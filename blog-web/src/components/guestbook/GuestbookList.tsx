'use client';

import GuestbookItem from './GuestbookItem';
import type { GuestbookVO } from '@/types';

interface GuestbookListProps {
  messages: GuestbookVO[];
}

export default function GuestbookList({ messages }: GuestbookListProps) {
  return (
    <div className="columns-1 md:columns-2 gap-6 space-y-6 [column-fill:_balance] relative">
      {messages.map((message) => (
        <GuestbookItem key={message.id} message={message} />
      ))}
    </div>
  );
}
