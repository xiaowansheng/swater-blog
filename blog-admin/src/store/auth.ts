import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import * as authApi from '@/api/auth'
import { getToken, setToken, removeToken } from '@/utils/storage'

interface AuthState {
  user: User | null
  token: string | null
  isLoginModalOpen: boolean
  setLoginModalOpen: (open: boolean) => void
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<void>
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: getToken(),
      isLoginModalOpen: false,
      setLoginModalOpen: (open: boolean) => set({ isLoginModalOpen: open }),
      login: async (username: string, password: string) => {
        const { token, user } = await authApi.login({ username, password })
        setToken(token)
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
      isAuthenticated: () => {
        return !!get().token
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)

