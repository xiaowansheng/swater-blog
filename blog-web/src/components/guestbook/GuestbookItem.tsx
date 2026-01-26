'use client';

import Image from '@/components/common/ImageWithPreview';
import type { GuestbookVO } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { usePathname } from '@/lib/i18n/routing';
import { useSiteConfig } from '@/lib/context/SiteConfigContext';
import { Card } from '@/components/ui/Card';

interface GuestbookItemProps {
  message: GuestbookVO;
}

// 格式化位置信息
function formatLocation(
  country: string | undefined,
  province: string | undefined,
  city: string | undefined,
  location: string | undefined,
  ipLocation: string | undefined
): string {
  // 优先使用经纬度解析的 location
  if (location) return location;

  // 其次使用 IP 解析的 ipLocation
  if (ipLocation) return ipLocation;

  // 最后才拼接 country, province, city
  const parts = [];
  if (country && country !== '中国') {
    parts.push(country);
  }
  if (province) {
    parts.push(province);
  }
  if (city && city !== province) {
    parts.push(city);
  }
  return parts.length > 0 ? parts.join(' · ') : '';
}

// 格式化设备和浏览器信息
function formatDeviceAndBrowser(device: string | undefined, browser: string | undefined): string {
  const parts = [];
  if (device) parts.push(device);
  if (browser) parts.push(browser);
  return parts.join(' · ');
}

export default function GuestbookItem({ message }: GuestbookItemProps) {
  const pathname = usePathname();
  const { privacy } = useSiteConfig();
  const locale = pathname?.split('/')[1] || 'zh';
  const displayName = message.nickname || message.userName || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();
  const isHidden = message.isVisible === 0;
  const isPending = message.reviewStatus === 0;
  const isRejected = message.reviewStatus === 2;

  const getStatusBadge = () => {
    if (isPending) {
      return <span className="inline-block px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">待审核</span>;
    }
    if (isRejected) {
      return <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">已拒绝</span>;
    }
    return null;
  };

  return (
    <Card className="p-5" variant="glass" hoverEffect={false}>
      {/* 第一部分：头像和作者信息 */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
            <span className="text-primary font-bold text-lg">{initial}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{displayName}</span>
            {getStatusBadge()}
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(message.createTime, 'YYYY-MM-DD HH:mm', locale)}
          </span>
        </div>
      </div>

      {/* 第二部分：留言内容 */}
      <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed mb-3">
        {isHidden && <span className="text-muted italic">留言已被隐藏 </span>}
        {message.content}
      </p>

      {/* 第三部分：地址和设备信息 */}
      {(privacy.showLocation || privacy.showDevice || privacy.showBrowser) &&
       (message.location || message.ipLocation || message.country || message.province || message.city || message.device || message.browser) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
          {/* 左边：地址 */}
          <div className="flex items-center gap-1 flex-1">
            {privacy.showLocation && formatLocation(message.country, message.province, message.city, message.location, message.ipLocation) && (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{formatLocation(message.country, message.province, message.city, message.location, message.ipLocation)}</span>
              </>
            )}
          </div>

          {/* 右边：设备和浏览器 */}
          <div className="flex items-center gap-1 flex-1 justify-end">
            {(privacy.showDevice || privacy.showBrowser) && formatDeviceAndBrowser(
              privacy.showDevice ? message.device : undefined,
              privacy.showBrowser ? message.browser : undefined
            ) && (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{formatDeviceAndBrowser(
                  privacy.showDevice ? message.device : undefined,
                  privacy.showBrowser ? message.browser : undefined
                )}</span>
              </>
            )}
          </div>
        </div>
      )}
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
    </Card>
  );
}
