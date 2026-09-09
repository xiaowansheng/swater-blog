'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserInfo {
  nickname: string;
  email: string;
  qq: string;
}

interface UserInfoStore extends UserInfo {
  setUserInfo: (info: Partial<UserInfo>) => void;
  clearUserInfo: () => void;
  isHydrated: boolean; // 标记是否已完成水合
}

const STORAGE_KEY = 'user-info';

/**
 * 用户信息全局状态管理
 *
 * ⚠️ 注意：此 hook 只能在客户端组件中使用
 * - 标记了 'use client' 的组件
 * - 在 useEffect 或事件处理器中调用
 *
 * ❌ 不能在服务端组件中使用
 * - 未标记 'use client' 的组件
 * - 在组件顶层直接调用（在函数体外部）
 *
 * @example
 * ```tsx
 * 'use client'
 * function MyComponent() {
 *   const userInfo = useUserInfoStore(); // ✅ 正确
 *   return <div>{userInfo.nickname}</div>;
 * }
 * ```
 */
export const useUserInfoStore = create<UserInfoStore>()(
  persist(
    (set) => ({
      nickname: '',
      email: '',
      qq: '',
      isHydrated: false,

      setUserInfo: (info) =>
        set((state) => ({
          ...state,
          ...info,
        })),

      clearUserInfo: () =>
        set({
          nickname: '',
          email: '',
          qq: '',
        }),
    }),
    {
      name: STORAGE_KEY,
      // 只持久化这些字段
      partialize: (state) => ({
        nickname: state.nickname,
        email: state.email,
        qq: state.qq,
      }),
      // 水合完成后设置标记
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.isHydrated = true;
      },
    }
  )
);

/**
 * 服务端安全的选择器
 * 只返回不依赖 localStorage 的默认值
 * 用于在服务端组件中获取类型信息，不会实际读取存储
 */
export function getEmptyUserInfo(): UserInfo {
  return {
    nickname: '',
    email: '',
    qq: '',
  };
}
