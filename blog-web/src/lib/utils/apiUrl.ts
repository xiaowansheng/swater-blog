/**
 * 将 API 路径与基础地址规范化：
 * - 去除 base 末尾与 path 开头的重复斜杠
 * - base 以 /api 结尾且 path 以 /api/ 开头时去重
 */
export function normalizeApiUrl(base: string, path: string): string {
  const baseTrim = base.endsWith('/') ? base.slice(0, -1) : base
  const pathTrim = path.startsWith('/') ? path : `/${path}`
  if (baseTrim.endsWith('/api') && pathTrim.startsWith('/api/')) {
    return baseTrim + pathTrim.slice(4)
  }
  return baseTrim + pathTrim
}
