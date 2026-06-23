import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LockscreenState {
  isLocked: boolean
  lastActivityAt: number | null
  lockScreen: () => void
  unlockScreen: (password: string) => boolean
  getCorrectPassword: () => string
  resetLock: () => void
  updateActivity: (timestamp?: number) => void
}

/**
 * 锁屏密码策略（优先级从高到低）：
 * 1) 构建期注入的 VITE_LOCKSCREEN_PASSWORD（部署时设为强随机值）；
 * 2) 用户在 localStorage 中自定义的 lockscreen-custom-password；
 * 3) 兜底：当前月日 MMDD（弱，仅用于无配置时的占位）。
 *
 * 注：锁屏仅是 UX 防误操作，非真实安全边界（浏览器开发者工具可绕过）。
 * 真正的会话保护由 JWT 过期 + 后端鉴权保障。
 */
function resolveLockscreenPassword(): string {
  // 1) 构建期环境变量
  const envPwd = import.meta.env.VITE_LOCKSCREEN_PASSWORD as string | undefined
  if (envPwd && envPwd.length >= 4) {
    return envPwd
  }
  // 2) 用户自定义（localStorage）
  try {
    const custom = localStorage.getItem('lockscreen-custom-password')
    if (custom && custom.length >= 4) {
      return custom
    }
  } catch {
    // localStorage 不可用时忽略
  }
  // 3) 兜底：MMDD
  const date = new Date()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}${day}`
}

export const useLockscreenStore = create<LockscreenState>()(
  persist(
    (set, get) => ({
      isLocked: false,
      lastActivityAt: null,

      lockScreen: () => {
        set({ isLocked: true })
      },

      unlockScreen: (password: string) => {
        const correctPassword = get().getCorrectPassword()
        if (password === correctPassword) {
          set({ isLocked: false, lastActivityAt: Date.now() })
          return true
        }
        return false
      },

      getCorrectPassword: () => {
        return resolveLockscreenPassword()
      },

      resetLock: () => {
        set({ isLocked: false, lastActivityAt: Date.now() })
      },

      updateActivity: (timestamp = Date.now()) => {
        set({ lastActivityAt: timestamp })
      },
    }),
    {
      name: 'lockscreen-storage',
      partialize: (state) => ({
        isLocked: state.isLocked,
        lastActivityAt: state.lastActivityAt,
      }),
    }
  )
)
