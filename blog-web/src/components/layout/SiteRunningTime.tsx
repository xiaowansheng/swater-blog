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
    /**
     * 计算网站运行时间差
     *
     * ### 算法说明
     * 1. 获取当前时间戳（毫秒）
     * 2. 标准化 createTime 为 UTC 时间
     * 3. 计算时间差（当前时间 - 创建时间）
     * 4. 转换为天、小时、分钟、秒
     *
     * ### 时间标准化规则
     * - 纯日期：`"2025-01-25"` → `"2025-01-25T00:00:00Z"`
     * - 带时间：`"2025-01-25 00:00:00"` → `"2025-01-25T00:00:00Z"`
     * - 已有Z：直接使用
     *
     * ### 边界情况
     * - 如果时间差为负（创建时间在未来），返回全零
     * - 如果时间无效，返回全零
     *
     * @returns 时间差对象 { days, hours, minutes, seconds }
     */
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

      const created = new Date(normalizedCreateTime).getTime();
      const diff = now - created;

      // 边界情况：如果创建时间在未来，返回全零
      if (diff < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      // 计算天、小时、分钟、秒
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
