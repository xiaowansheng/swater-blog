/**
 * 内容转换器
 * 负责Markdown/HTML/Lake格式之间的转换
 */

import { marked } from 'marked'
import TurndownService from 'turndown'
import slugify from 'slugify'

export interface ProcessContentOptions {
  format?: 'markdown' | 'html' | 'lake'
  downloadImages?: boolean
  imageStoragePath?: string
}

export class ContentTransformer {
  private turndown: TurndownService

  constructor() {
    // 配置Markdown转换器
    marked.setOptions({
      breaks: true,
      gfm: true,
    })

    // 配置HTML到Markdown转换器
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    })
  }

  /**
   * 处理内容
   */
  async processContent(
    content: string,
    options: ProcessContentOptions = {}
  ): Promise<string> {
    const { format = 'markdown' } = options

    // 根据格式处理
    if (format === 'markdown') {
      // 已经是Markdown，直接返回
      return content
    } else if (format === 'html') {
      // HTML转Markdown
      return this.htmlToMarkdown(content)
    } else if (format === 'lake') {
      // Lake格式暂时不支持
      console.warn('Lake格式暂不支持转换，使用原内容')
      return content
    }

    return content
  }

  /**
   * Markdown转HTML
   */
  markdownToHtml(markdown: string): string {
    return marked(markdown) as string
  }

  /**
   * HTML转Markdown
   */
  htmlToMarkdown(html: string): string {
    return this.turndown.turndown(html)
  }

  /**
   * 提取摘要
   */
  extractExcerpt(content: string, length: number = 200): string {
    // 移除Markdown语法
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // 标题
      .replace(/\*\*/g, '') // 粗体
      .replace(/\*/g, '') // 斜体
      .replace(/`{1,3}/g, '') // 代码
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // 图片
      .replace(/\n+/g, ' ') // 换行
      .trim()

    return plainText.substring(0, length)
  }

  /**
   * URL友好化
   */
  slugify(text: string): string {
    return slugify(text, {
      lower: true,
      strict: true,
      locale: 'zh',
    })
  }

  /**
   * 清理Markdown
   */
  sanitizeMarkdown(markdown: string): string {
    return markdown
      .replace(/\r\n/g, '\n') // 统一换行符
      .replace(/\n{3,}/g, '\n\n') // 移除多余空行
      .trim()
  }

  /**
   * 处理图片URL
   */
  processImages(
    content: string,
    strategy: 'keep' | 'download' | 'upload'
  ): string {
    if (strategy === 'keep') {
      return content
    }

    // TODO: 实现图片下载和上传
    return content
  }

  /**
   * 转换相对链接为绝对链接
   */
  convertRelativeLinks(
    content: string,
    baseUrl: string
  ): string {
    // 匹配Markdown链接语法
    return content.replace(
      /\[([^\]]+)\]\((?!https?:\/\/)([^)]+)\)/g,
      (match, text, url) => {
        const absoluteUrl = new URL(url, baseUrl).href
        return `[${text}](${absoluteUrl})`
      }
    )
  }
}
