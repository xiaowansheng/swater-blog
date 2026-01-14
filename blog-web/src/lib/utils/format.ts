import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

dayjs.extend(relativeTime);

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

/**
 * 转换文件路径为完整可访问 URL
 * @param path 相对路径或绝对路径
 * @returns 完整 URL
 */
export function getFullUrl(path: string | undefined): string {
  if (!path) return '';
  
  // 如果是完整 URL 或 base64，直接返回
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  const resourcePrefix = process.env.NEXT_PUBLIC_UPLOAD_RESOURCE_PREFIX || (process.env as any).VITE_UPLOAD_RESOURCE_PREFIX;
  
  if (resourcePrefix) {
    // 如果路径已经包含了 resourcePrefix，则直接返回
    if (path.startsWith(resourcePrefix)) {
      return path;
    }
    // 标准化路径，确保以 / 开头
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    // 如果 resourcePrefix 以 / 结尾，而 normalizedPath 也以 / 开头，去掉一个
    const finalPrefix = resourcePrefix.endsWith('/') ? resourcePrefix.slice(0, -1) : resourcePrefix;
    return `${finalPrefix}${normalizedPath}`;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const prefix = ''; // 假设 web 端也需要这个前缀，或者根据后端配置
  
  // 标准化路径，确保以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // 如果路径已经包含了 baseUrl + prefix，则直接返回
  if (normalizedPath.startsWith(`${baseUrl}${prefix}`)) {
    return normalizedPath;
  }
  
  // 如果路径以 prefix 开头，补全 baseUrl
  if (normalizedPath.startsWith(prefix)) {
    return `${baseUrl}${normalizedPath}`;
  }

  // 否则视为纯相对路径，进行拼接
  return `${baseUrl}${prefix}${normalizedPath}`;
}

/**
 * 去除 Markdown 标签，返回纯文本
 * @param md Markdown 文本
 * @returns 纯文本
 */
export function stripMarkdown(md: string | undefined): string {
  if (!md) return '';
  return md
    // 去除图片
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // 去除链接
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // 去除标题
    .replace(/^#+\s+/gm, '')
    // 去除加粗、斜体
    .replace(/[*_]{1,3}(.*?)[*_]{1,3}/g, '$1')
    // 去除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 去除行内代码
    .replace(/`(.*?)`/g, '$1')
    // 去除 HTML 标签
    .replace(/<[^>]*>/g, '')
    // 去除多余空格和换行
    .replace(/\s+/g, ' ')
    .trim();
}

