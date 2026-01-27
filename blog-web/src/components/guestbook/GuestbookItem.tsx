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
  if (location) return location;
  if (ipLocation) return ipLocation;

  const parts = [];
  if (country && country !== '中国') parts.push(country);
  if (province) parts.push(province);
  if (city && city !== province) parts.push(city);
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
      return <span className="inline-block px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-yellow-100 text-yellow-600 rounded-full border border-yellow-200">待审核</span>;
    }
    if (isRejected) {
      return <span className="inline-block px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-red-100 text-red-600 rounded-full border border-red-200">已拒绝</span>;
    }
    return null;
  };

  // 生成随机柔和背景色给头像
  const avatarColors = [
    'bg-red-100 text-red-600',
    'bg-orange-100 text-orange-600',
    'bg-amber-100 text-amber-600',
    'bg-green-100 text-green-600',
    'bg-emerald-100 text-emerald-600',
    'bg-teal-100 text-teal-600',
    'bg-cyan-100 text-cyan-600',
    'bg-sky-100 text-sky-600',
    'bg-blue-100 text-blue-600',
    'bg-indigo-100 text-indigo-600',
    'bg-violet-100 text-violet-600',
    'bg-purple-100 text-purple-600',
    'bg-fuchsia-100 text-fuchsia-600',
    'bg-pink-100 text-pink-600',
    'bg-rose-100 text-rose-600',
  ];
  const colorIndex = (displayName.length + (message.id || 0)) % avatarColors.length;
  const avatarClass = avatarColors[colorIndex];

  return (
    <div className="group break-inside-avoid mb-6">
      <div 
        className="relative bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-[2rem] p-5 border border-primary/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:rotate-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-primary/20"
      >
        {/* 装饰性的小圆点 */}
        <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 rounded-full bg-primary/20"></div>
          <div className="w-2 h-2 rounded-full bg-secondary/20"></div>
        </div>

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
              <span className="w-0.5 h-2.5 bg-border rounded-full"></span>
               {/* 简化后的位置显示 */}
               {(privacy.showLocation && (message.location || message.ipLocation || message.country || message.province || message.city)) ? (
                <span className="truncate max-w-[120px]">
                   {formatLocation(message.country, message.province, message.city, message.location, message.ipLocation)}
                </span>
               ) : (
                 <span>Earth</span>
               )}
            </div>
          </div>
        </div>

        {/* 内容区域 - 类似气泡风格 */}
        <div className="relative z-10">
            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[15px] font-medium">
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

        {/* 底部设备信息 - 更加隐晦 */}
        {(privacy.showDevice || privacy.showBrowser) && 
         (message.device || message.browser) && (
          <div className="mt-3 pt-3 border-t border-dashed border-primary/10 flex items-center justify-end gap-2 text-[10px] text-muted-foreground/50 opacity-0 group-hover:opacity-70 transition-opacity">
               {formatDeviceAndBrowser(
                  privacy.showDevice ? message.device : undefined,
                  privacy.showBrowser ? message.browser : undefined
               )}
          </div>
        )}
      </div>
    </div>
  );
}
