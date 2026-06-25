/**
 * 富文本 HTML 清洗（已废弃透传实现）。
 *
 * 安全责任已上移到后端写入时：blog-service 的 HtmlSanitizer（jsoup 白名单）
 * 在 moment 等富文本入库前完成 XSS 清洗，库内即安全，前端渲染端不再重复清洗。
 *
 * 此函数保留为透传，仅为兼容既有调用点；新代码可直接使用原始 HTML。
 * 长期可在调用点替换为直接传值后删除该函数。
 *
 * @deprecated 富文本清洗由后端 HtmlSanitizer 在写入时完成，前端无需再清洗。
 */
export function sanitizeHtml(html: string | undefined | null): string {
  return html ?? ''
}
