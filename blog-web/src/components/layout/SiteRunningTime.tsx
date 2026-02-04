/**
 * 网站运行时间显示组件
 *
 * ## 时区处理方案
 *
 * 本组件统一按 UTC 时间计算运行时间，确保全球用户看到一致的运行时长。
 *
 * ### 工作流程
 * 1. 接收后端传来的 createTime（UTC ISO 格式，如 "2025-01-24T16:00:00.000Z"）
 * 2. 标准化为 UTC 时间（添加 Z 后缀确保按 UTC 解析）
 * 3. 计算与当前时间的差值
 * 4. 每秒更新一次显示
 *
 * ### 兼容性处理
 * - 纯日期格式：`"2025-01-25"` → `"2025-01-25T00:00:00Z"`（按 UTC 解析）
 * - 带时间格式：`"2025-01-25 00:00:00"` → `"2025-01-25T00:00:00Z"`（按 UTC 解析）
 * - 标准 UTC：`"2025-01-25T00:00:00.000Z"` → 直接使用
 *
 * ### 全局一致性示例
 * ```
 * 存储的 UTC 时间：2025-01-24T16:00:00.000Z
 *
 * 北京用户（UTC+8）：
 *   - 当前时间：2025-01-28 15:39:00
 *   - 解析 UTC：2025-01-24 16:00:00
 *   - 运行时间：3天 23小时 39分钟 ✅
 *
 * 纽约用户（UTC-5）：
 *   - 当前时间：2025-01-28 02:39:00
 *   - 解析 UTC：2025-01-24 16:00:00
 *   - 运行时间：3天 10小时 39分钟 ✅
 *
 * 结论：虽然本地时间不同，但运行时长一致！
 * ```
 *
 * ### 技术要点
 * - 所有时间统一按 UTC 解析，避免时区差异
 * - 使用 `getTime()` 获取毫秒级时间戳进行计算
 * - 实时更新，每秒刷新一次
 *
 * @author Claude Code
 * @since 2025-01-28
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

const ZERO_DIFF: TimeDifference = { days: 0, hours: 0, minutes: 0, seconds: 0 };

export default function SiteRunningTime({ createTime }: SiteRunningTimeProps) {
  const t = useTranslations('common');
  const [timeDiff, setTimeDiff] = useState<TimeDifference>(ZERO_DIFF);
  const createdAtRef = useRef<number>(0);

  const calculateTimeDiff = useCallback(() => {
    if (!Number.isFinite(createdAtRef.current)) {
      return ZERO_DIFF;
    }
    const now = Date.now();
    const diff = now - createdAtRef.current;
    if (diff < 0) {
      return ZERO_DIFF;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }, []);

  useEffect(() => {
    let normalizedCreateTime = createTime;
    if (/^\d{4}-\d{2}-\d{2}$/.test(createTime)) {
      normalizedCreateTime = `${createTime}T00:00:00Z`;
    } else if (!createTime.endsWith('Z') && !createTime.includes('+') && !createTime.includes('T00:00:00Z')) {
      normalizedCreateTime = createTime.replace(' ', 'T') + 'Z';
    }
    const parsedTimestamp = new Date(normalizedCreateTime).getTime();
    createdAtRef.current = Number.isFinite(parsedTimestamp) ? parsedTimestamp : 0;
    setTimeDiff(calculateTimeDiff());
  }, [createTime, calculateTimeDiff]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeDiff(calculateTimeDiff());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeDiff]);

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
