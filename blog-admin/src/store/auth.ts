import { create } from 'zustand'
import { User } from '@/types'
import * as authApi from '@/api/auth'
import { getToken, setToken, removeToken } from '@/utils/storage'
import { encryptPasswordRsaOaep } from '@/utils/crypto'

interface AuthState {
  user: User | null
  token: string | null
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
  token: getToken(),
  isLoginModalOpen: false,
  isLoginExpiredModalOpen: false,
  setLoginModalOpen: (open: boolean) => set({ isLoginModalOpen: open }),
  setLoginExpiredModalOpen: (open: boolean) => set({ isLoginExpiredModalOpen: open }),
  login: async (username: string, password: string, rememberMe?: boolean) => {
    const { publicKey, nonce } = await authApi.getLoginNonce()
    const encryptedPassword = await encryptPasswordRsaOaep(publicKey, password)
    const { token, user } = await authApi.login({ username, encryptedPassword, nonce, rememberMe })
    setToken(token, rememberMe)
    set({ token, user })
  },
  loginWithEmail: async (email: string, code: string, rememberMe?: boolean) => {
    const { token, user } = await authApi.loginWithEmail({ email, code, rememberMe })
    setToken(token, rememberMe)
    set({ token, user })
  },
  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      removeToken()
      set({ token: null, user: null })
    }
  },
  getCurrentUser: async () => {
    try {
      const user = await authApi.getCurrentUser()
      set({ user })
    } catch (error) {
      // 如果获取当前用户失败，说明 token 已经失效或网络有问题
      // 我们这里不强制登出，让 request.ts 的 401 拦截器处理
      set({ user: null })
    }
  },
  handleTokenExpired: () => {
    // 清除用户信息但保留 token，让用户选择是否重新登录
    set({ user: null, isLoginExpiredModalOpen: true })
  },
  isAuthenticated: () => {
    return !!get().token
  },
}))

