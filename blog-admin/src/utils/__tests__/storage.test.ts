import { describe, it, expect, beforeEach } from 'vitest'
import { isLoggedIn, getRememberMe, setRememberMe } from '@/utils/storage'
import config from '@/config'

describe('rememberMe', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('默认未记住', () => {
    expect(getRememberMe()).toBe(false)
  })

  it('写入后可读取', () => {
    setRememberMe(true)
    expect(getRememberMe()).toBe(true)
    setRememberMe(false)
    expect(getRememberMe()).toBe(false)
  })

  it('带存储前缀', () => {
    setRememberMe(true)
    expect(localStorage.getItem(`${config.storagePrefix}remember_me`)).toBe('true')
  })
})

describe('isLoggedIn', () => {
  const originalCookie = document.cookie

  it('存在登录标记 Cookie 时返回 true', () => {
    document.cookie = 'blog_admin_logged_in=1'
    expect(isLoggedIn()).toBe(true)
  })

  it('无登录标记 Cookie 时返回 false', () => {
    document.cookie = ''
    expect(isLoggedIn()).toBe(false)
  })

  it('其他 Cookie 不影响判断', () => {
    document.cookie = 'other=value'
    expect(isLoggedIn()).toBe(false)
  })

  it('还原 cookie', () => {
    document.cookie = originalCookie
  })
})
