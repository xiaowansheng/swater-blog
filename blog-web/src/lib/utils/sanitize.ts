import DOMPurify from 'isomorphic-dompurify'

/**
 * 清洗富文本 HTML，防止存储型 XSS。
 * 使用 isomorphic-dompurify 以同时支持 Next.js 服务端渲染与客户端渲染。
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  })
}
