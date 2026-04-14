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
        const date = new Date()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${month}${day}`
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
