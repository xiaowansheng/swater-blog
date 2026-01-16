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
      const created = new Date(createTime).getTime();
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
