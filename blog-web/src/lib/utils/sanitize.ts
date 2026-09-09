/**
 * 轻量级 HTML 清洗，用于防范存储型 XSS。
 *
 * 背景：文章正文是 Markdown，经 Vditor.preview 渲染成 HTML 后直接注入 DOM；
 * 说说内容是 HTML，经后端 HtmlSanitizer 清洗后由 dangerouslySetInnerHTML 注入。
 * 为防止 Markdown/HTML 中夹带的 <script>、on* 事件属性、javascript: 协议在浏览器端执行，
 * 在前端渲染端再做一次清洗兜底。
 *
 * 实现为纯 DOM 操作，不依赖外部库（DOMPurify 等），兼容 SSR（仅在浏览器环境执行 DOM 逻辑）。
 */

const DANGEROUS_TAGS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'base',
  'meta',
  'link',
  'style',
]);

/** 允许放行的 base64 位图 data URI（不含 svg，svg 可承载脚本） */
const SAFE_DATA_IMAGE = /^data:image\/(png|gif|jpeg|jpg|webp|bmp|avif);base64,/;

/**
 * 判断 URL 属性值是否使用危险协议。
 * DOMParser 已解码 HTML 实体，但浏览器寻址时还会忽略值中的空白与控制字符
 * （如 "jav&#x09;ascript:" 解码后为 "jav\tascript:"），因此先剥离再判断前缀。
 */
function isDangerousUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = value.replace(/[\s\x00-\x20\x7f]+/g, '').toLowerCase();
  if (!normalized) return false;
  if (/^(javascript|vbscript|livescript|mocha):/.test(normalized)) return true;
  if (normalized.startsWith('data:')) {
    return !SAFE_DATA_IMAGE.test(normalized);
  }
  return false;
}

/**
 * SSR 正则回退用的链接属性白名单：
 * 无法完整解码实体，改为仅放行明确安全的值前缀（相对路径/锚点/http(s)/mailto/位图 data URI），
 * 其余（含各种实体编码、空白混淆的危险协议）一律替换为 "#"。
 */
function isSafeUrlAttribute(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (isDangerousUrl(trimmed)) return false;
  return /^(https?:|mailto:|[/#]|data:image\/(png|gif|jpeg|jpg|webp|bmp|avif);base64,)/i.test(trimmed);
}

/**
 * 清洗一个已渲染的 DOM 容器：移除危险标签节点、on* 事件属性、危险协议。
 * 在 Vditor.preview 的 after 回调中调用。
 */
export function sanitizeDomContainer(container: HTMLElement | null): void {
  if (!container || typeof window === 'undefined') return;

  // 1. 移除危险标签节点（script/iframe/object/embed/form/base/meta/link/style）
  const dangerousNodes = container.querySelectorAll<HTMLElement>(
    Array.from(DANGEROUS_TAGS).join(','),
  );
  dangerousNodes.forEach((node) => {
    node.remove();
  });

  // 2. 遍历所有元素，移除 on* 事件属性与危险 href/src 协议
  const allElements = container.getElementsByTagName('*');
  // 转为静态数组，避免遍历过程中 DOM 修改导致跳过
  const elements: Element[] = [];
  for (let i = 0; i < allElements.length; i++) {
    elements.push(allElements[i]);
  }
  for (const el of elements) {
    // 移除所有 on* 事件属性
    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
      if (/^on/i.test(attr.name)) {
        el.removeAttribute(attr.name);
        continue;
      }
      // href/src/action 等链接属性：禁止 javascript:/vbscript:/data: 等危险协议（含空白混淆变体）
      if (/^(href|src|action|formaction|xlink:href|data)$/i.test(attr.name)) {
        if (isDangerousUrl(attr.value)) {
          el.removeAttribute(attr.name);
        }
      }
    }
  }
}

/**
 * 清洗 HTML 字符串：在浏览器端借助 DOMParser 解析后清洗再序列化；
 * SSR 环境（无 window）无法解析 DOM，回退为正则剥离 <script> 等危险标签的兜底处理。
 * 供 dangerouslySetInnerHTML 场景使用（如说说内容）。
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';

  // 浏览器环境：用 DOMParser 做真实 DOM 清洗
  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    sanitizeDomContainer(doc.body);
    return doc.body.innerHTML;
  }

  // SSR 兜底：正则移除 <script>...</script>、on*= 属性，链接属性走白名单
  // 注：后端 HtmlSanitizer 已对说说内容做过白名单清洗，此处仅做防御性二次处理
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(
      /\s(href|src|action|formaction|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
      (match: string, attr: string, dq?: string, sq?: string) => {
        const value = dq !== undefined ? dq : (sq ?? '');
        if (isSafeUrlAttribute(value)) return match;
        return ` ${attr.toLowerCase()}="#"`;
      },
    );
}
