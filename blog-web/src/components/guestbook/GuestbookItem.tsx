'use client';

import Image from '@/components/common/ImageWithPreview';
import type { GuestbookVO } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { usePathname } from '@/lib/i18n/routing';

interface GuestbookItemProps {
  message: GuestbookVO;
}

export default function GuestbookItem({ message }: GuestbookItemProps) {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';
  const displayName = message.nickname || message.userName || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();
  const isHidden = message.isVisible === 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
            <span className="text-primary font-bold text-lg">{initial}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-semibold text-foreground">{displayName}</span>
            <span className="text-sm text-muted flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(message.createTime, 'YYYY-MM-DD HH:mm', locale)}
            </span>
          </div>
          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {isHidden && <span className="text-muted italic">留言已被隐藏 </span>}
            {message.content}
          </p>
          {message.images && message.images.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {message.images.map((src, index) => (
                <Image
                  key={`${message.id}-${index}`}
                  src={src}
                  alt={`${displayName} image ${index + 1}`}
                  width={320}
                  height={200}
                  className="rounded-lg border border-border w-full h-40 object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
