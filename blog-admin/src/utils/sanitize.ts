import DOMPurify from 'dompurify'

/**
 * 清洗富文本 HTML，防止存储型 XSS。
 * 用于在 dangerouslySetInnerHTML 渲染前对内容做消毒。
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  })
}
