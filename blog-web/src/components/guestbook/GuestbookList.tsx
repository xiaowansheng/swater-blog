'use client';

import GuestbookItem from './GuestbookItem';
import type { GuestbookVO } from '@/types';

interface GuestbookListProps {
  messages: GuestbookVO[];
}

export default function GuestbookList({ messages }: GuestbookListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <GuestbookItem key={message.id} message={message} />
      ))}
    </div>
  );
}
