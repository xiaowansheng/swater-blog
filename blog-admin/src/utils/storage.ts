import config from '@/config'

const REMEMBER_ME_KEY = `${config.storagePrefix}remember_me`

// 登录状态标记 Cookie 名称（后端 AuthServiceImpl 写入，仅存 0/1）。
// 真实 token 在 httpOnly Cookie 中，前端 JS 无法读取。
const LOGIN_FLAG_COOKIE = 'blog_admin_logged_in'

export const isLoggedIn = (): boolean => {
  return document.cookie.split(';').some((part) => part.trim().startsWith(`${LOGIN_FLAG_COOKIE}=`))
}

export const getRememberMe = (): boolean => {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true'
}

export const setRememberMe = (remember: boolean): void => {
  localStorage.setItem(REMEMBER_ME_KEY, String(remember))
}
