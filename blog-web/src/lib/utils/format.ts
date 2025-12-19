import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

export function formatDate(
  date: string | Date,
  format: string = 'YYYY-MM-DD HH:mm:ss',
  locale: string = 'zh-cn'
): string {
  dayjs.locale(locale);
  return dayjs(date).format(format);
}

export function formatRelativeTime(
  date: string | Date,
  locale: string = 'zh-cn'
): string {
  dayjs.locale(locale);
  return dayjs(date).fromNow();
}

export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

