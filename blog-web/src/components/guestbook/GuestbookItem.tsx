'use client';

import Image from '@/components/common/ImageWithPreview';
import { GuestbookReviewStatus, GuestbookVisibilityStatus, type GuestbookVO } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { usePathname } from '@/lib/i18n/routing';
import { useSiteConfig } from '@/lib/context/SiteConfigContext';
import { Card } from '@/components/ui/Card';
import { UAList } from '@/components/common/UAIcon';

function formatIp(ip: string | undefined): string {
  if (!ip) return '';
  return `IP: ${ip}`;
}
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
  if (location) return location;
  if (ipLocation) return ipLocation;

  const parts = [];
  if (country && country !== '中国') parts.push(country);
  if (province) parts.push(province);
  if (city && city !== province) parts.push(city);
  return parts.length > 0 ? parts.join(' · ') : '';
}

export default function GuestbookItem({ message }: GuestbookItemProps) {
  const pathname = usePathname();
  const { privacy } = useSiteConfig();
  const locale = pathname?.split('/')[1] || 'zh';
  const displayName = message.nickname || message.userName || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();
  const isHidden = message.isVisible === GuestbookVisibilityStatus.HIDDEN;
  const isPending = message.reviewStatus === GuestbookReviewStatus.PENDING;
  const isRejected = message.reviewStatus === GuestbookReviewStatus.REJECTED;

  const locationText = privacy.showLocation
    ? formatLocation(message.country, message.province, message.city, message.location, message.ipLocation)
    : '';
  const ipText = privacy.showIp ? formatIp(message.ip) : '';
  const hasMeta = Boolean(locationText || ipText);

  const getStatusBadge = () => {
    if (isPending) {
      return (
        <span className="inline-block px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full border border-yellow-200 dark:border-yellow-800/50">
          待审核
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-block px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full border border-red-200 dark:border-red-800/50">
          已拒绝
        </span>
      );
    }
    return null;
  };

  // 生成随机柔和背景色给头像
  const avatarColors = [
    'bg-red-500/10 text-red-500',
    'bg-orange-500/10 text-orange-500',
    'bg-amber-500/10 text-amber-500',
    'bg-green-500/10 text-green-500',
    'bg-emerald-500/10 text-emerald-500',
    'bg-teal-500/10 text-teal-500',
    'bg-cyan-500/10 text-cyan-500',
    'bg-sky-500/10 text-sky-500',
    'bg-blue-500/10 text-blue-500',
    'bg-indigo-500/10 text-indigo-500',
    'bg-violet-500/10 text-violet-500',
    'bg-purple-500/10 text-purple-500',
    'bg-fuchsia-500/10 text-fuchsia-500',
    'bg-pink-500/10 text-pink-500',
    'bg-rose-500/10 text-rose-500',
  ];
  const colorIndex = (displayName.length + (message.id || 0)) % avatarColors.length;
  const avatarClass = avatarColors[colorIndex];
  
  // Deterministic rotation based on ID to avoid hydration mismatch
  const rotation = ((message.id || 0) % 5) - 2;

  return (
    <Card 
      className="group break-inside-avoid mb-6 relative overflow-hidden" 
      style={{ transform: `rotate(${rotation}deg)` }}
      variant="default"
    >
        {/* 装饰性的小圆点 */}
        <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 rounded-full bg-primary/20"></div>
          <div className="w-2 h-2 rounded-full bg-secondary/20"></div>
        </div>

        <div className="p-5">
          {/* 头部：头像与信息 */}
          <div className="flex items-start gap-3.5 mb-3">
            <div className="flex-shrink-0 mt-1">
              <div className={`w-10 h-10 rounded-2xl ${avatarClass} flex items-center justify-center font-black text-lg shadow-sm transform -rotate-3 group-hover:rotate-0 transition-transform duration-300`}>
                {initial}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-bold text-foreground text-[15px]">{displayName}</span>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                <span className="flex items-center gap-1">
                  {formatDate(message.createTime, 'MM-DD HH:mm', locale)}
                </span>
              </div>
            </div>
          </div>

          {/* 内容区域 - 类似气泡风格 */}
          <div className="relative z-10">
              <p className="text-foreground/90 whitespace-pre-wrap break-words leading-relaxed text-[15px] font-medium">
                  {isHidden && <span className="text-muted-foreground/60 italic text-sm block mb-1">Passerby whispers... (Hidden)</span>}
                  {message.content}
              </p>

              {message.images && message.images.length > 0 && (
                  <div className="mt-3 grid gap-2 grid-cols-2">
                  {message.images.map((src, index) => (
                      <div key={`${message.id}-${index}`} className="relative group/img overflow-hidden rounded-xl border border-border/50 aspect-square">
                      <Image
                          src={src}
                          alt={`${displayName} image ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                          />
                      </div>
                  ))}
                  </div>
              )}
          </div>

          {/* 隐私信息 - 放在内容下面，避免影响头部布局 */}
          {hasMeta && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/80">
              {locationText && (
                <span className="flex items-center gap-1 min-w-0 group/location">
                  <svg className="w-3.5 h-3.5 text-primary/60 group-hover/location:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate max-w-[8rem] sm:max-w-none">{locationText}</span>
                </span>
              )}
              {ipText && (
                <span className="flex items-center gap-1 min-w-0 group/ip">
                  <svg className="w-3.5 h-3.5 text-primary/60 group-hover/ip:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    <circle cx="12" cy="12" r="3" strokeWidth={2} />
                  </svg>
                  <span className="truncate max-w-[6rem] sm:max-w-none">{ipText}</span>
                </span>
              )}
              {(privacy.showDevice || privacy.showBrowser) && (message.device || message.browser) && (
                <UAList 
                  device={privacy.showDevice ? message.device : undefined} 
                  browser={privacy.showBrowser ? message.browser : undefined}
                  className="text-[10px] text-muted-foreground/50"
                />
              )}
            </div>
          )}

          {/* 设备信息已合并到隐私信息区域 */}
        </div>
    </Card>
  );
}
