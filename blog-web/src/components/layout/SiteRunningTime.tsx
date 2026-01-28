'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface SiteRunningTimeProps {
  createTime: string;
}

interface TimeDifference {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function SiteRunningTime({ createTime }: SiteRunningTimeProps) {
  const t = useTranslations('common');
  const [timeDiff, setTimeDiff] = useState<TimeDifference>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // 计算时间差的函数
    const calculateTimeDiff = () => {
      const now = new Date().getTime();
      // 统一按 UTC 时间解析 createTime（后端存储时已转换为 UTC）
      // 这样无论访问者在哪个时区，看到的运行时间都是一致的
      let normalizedCreateTime = createTime;
      if (/^\d{4}-\d{2}-\d{2}$/.test(createTime)) {
        // 纯日期格式，按 UTC 时间的 00:00:00 解析
        normalizedCreateTime = `${createTime}T00:00:00Z`;
      } else if (!createTime.endsWith('Z') && !createTime.includes('+') && !createTime.includes('T00:00:00Z')) {
        // 如果已有时间部分但没有时区信息，补充 UTC 标识
        normalizedCreateTime = createTime.replace(' ', 'T') + 'Z';
      }

      // 调试信息：输出时间解析详情（开发环境）
      if (process.env.NODE_ENV === 'development') {
        const createdDate = new Date(normalizedCreateTime);
        console.group('🕐 SiteRunningTime Debug');
        console.log('原始输入:', createTime);
        console.log('标准化后:', normalizedCreateTime);
        console.log('UTC时间:', createdDate.toISOString());
        console.log('本地时间:', createdDate.toLocaleString());
        console.log('时区偏移:', createdDate.getTimezoneOffset(), '分钟');
        console.groupEnd();
      }

      const created = new Date(normalizedCreateTime).getTime();
      const diff = now - created;

      if (diff < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // 立即计算一次
    setTimeDiff(calculateTimeDiff());

    // 每秒更新一次
    const timer = setInterval(() => {
      setTimeDiff(calculateTimeDiff());
    }, 1000);

    return () => clearInterval(timer);
  }, [createTime]);

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
      <span className="font-medium">{t('siteRunningTime')}</span>
      <span className="font-bold text-primary" title="Site Running Time">
        {timeDiff.days}{t('day')} {timeDiff.hours}{t('hour')} {timeDiff.minutes}{t('minute')} {timeDiff.seconds}{t('second')}
      </span>
    </div>
  );
}
