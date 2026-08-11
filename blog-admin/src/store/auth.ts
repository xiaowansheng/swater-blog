import { create } from 'zustand'
import { User } from '@/types'
import * as authApi from '@/api/auth'
import { isLoggedIn } from '@/utils/storage'
import { encryptPasswordRsaOaep } from '@/utils/crypto'

interface AuthState {
  user: User | null
  isLoginModalOpen: boolean
  isLoginExpiredModalOpen: boolean
  setLoginModalOpen: (open: boolean) => void
  setLoginExpiredModalOpen: (open: boolean) => void
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>
  loginWithEmail: (email: string, code: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<void>
  handleTokenExpired: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoginModalOpen: false,
  isLoginExpiredModalOpen: false,
  setLoginModalOpen: (open: boolean) => set({ isLoginModalOpen: open }),
  setLoginExpiredModalOpen: (open: boolean) => set({ isLoginExpiredModalOpen: open }),
  login: async (username: string, password: string, rememberMe?: boolean) => {
    const { publicKey, nonce } = await authApi.getLoginNonce()
    const encryptedPassword = await encryptPasswordRsaOaep(publicKey, password)
    const { user } = await authApi.login({ username, encryptedPassword, nonce, rememberMe })
    set({ user })
  },
  loginWithEmail: async (email: string, code: string, rememberMe?: boolean) => {
    const { user } = await authApi.loginWithEmail({ email, code, rememberMe })
    set({ user })
  },
  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      set({ user: null })
    }
  },
  getCurrentUser: async () => {
    try {
      const user = await authApi.getCurrentUser()
      set({ user })
    } catch (error) {
      // 获取当前用户失败：token 已失效或网络异常，交给 request.ts 的 401 拦截器处理
      console.warn('获取当前用户失败', error)
      set({ user: null })
    }
  },
  handleTokenExpired: () => {
    // 清除用户信息但保留会话，让用户选择是否重新登录
    set({ user: null, isLoginExpiredModalOpen: true })
  },
  isAuthenticated: () => {
    // 同步判断：登录标记 Cookie（非 httpOnly，仅 0/1）；刷新后 user 由 BasicLayout 重新拉取
    return !!get().user || isLoggedIn()
  },
}))
