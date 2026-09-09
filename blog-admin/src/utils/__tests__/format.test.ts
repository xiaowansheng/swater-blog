import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatNumber,
  formatFileSize,
  getFullUrl,
  toRelativeUrl,
} from '@/utils/format'

describe('formatDate', () => {
  it('空值返回占位符', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate(undefined)).toBe('-')
    expect(formatDate('')).toBe('-')
  })

  it('按默认格式化输出', () => {
    expect(formatDate('2026-09-09T10:20:30')).toBe('2026-09-09 10:20:30')
  })

  it('支持自定义格式', () => {
    expect(formatDate('2026-09-09T10:20:30', 'YYYY/MM/DD')).toBe('2026/09/09')
  })
})

describe('formatNumber', () => {
  it('万以下直接输出', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(9999)).toBe('9999')
  })

  it('万以上保留一位小数', () => {
    expect(formatNumber(10000)).toBe('1.0万')
    expect(formatNumber(23456)).toBe('2.3万')
  })
})

describe('formatFileSize', () => {
  it('0 字节特殊处理', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('单位换算', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
  })
})

describe('getFullUrl', () => {
  it('非字符串或空值返回空串', () => {
    expect(getFullUrl(undefined)).toBe('')
    expect(getFullUrl(null)).toBe('')
    expect(getFullUrl('')).toBe('')
    expect(getFullUrl(123)).toBe('')
  })

  it('完整 URL / base64 / 协议相对路径原样返回', () => {
    expect(getFullUrl('http://a.com/x.png')).toBe('http://a.com/x.png')
    expect(getFullUrl('https://a.com/x.png')).toBe('https://a.com/x.png')
    expect(getFullUrl('data:image/png;base64,xxx')).toBe('data:image/png;base64,xxx')
    expect(getFullUrl('//cdn.a.com/x.png')).toBe('//cdn.a.com/x.png')
  })

  it('相对路径拼接资源前缀', () => {
    expect(getFullUrl('avatar/a.png')).toBe('/uploads/avatar/a.png')
    expect(getFullUrl('./avatar/a.png')).toBe('/uploads/avatar/a.png')
    expect(getFullUrl('/avatar/a.png')).toBe('/uploads/avatar/a.png')
  })

  it('已带资源前缀的路径不重复拼接', () => {
    expect(getFullUrl('/uploads/avatar/a.png')).toBe('/uploads/avatar/a.png')
  })
})

describe('toRelativeUrl', () => {
  it('非字符串或空值返回空串', () => {
    expect(toRelativeUrl('')).toBe('')
    expect(toRelativeUrl(null)).toBe('')
  })

  it('完整 URL 原样返回', () => {
    expect(toRelativeUrl('https://a.com/x.png')).toBe('https://a.com/x.png')
  })

  it('路径统一为 ./ 前缀', () => {
    expect(toRelativeUrl('./a.png')).toBe('./a.png')
    expect(toRelativeUrl('/a.png')).toBe('./a.png')
    expect(toRelativeUrl('a.png')).toBe('./a.png')
  })
})
