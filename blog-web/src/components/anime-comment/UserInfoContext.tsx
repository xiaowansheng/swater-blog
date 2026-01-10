'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUserInfoStore } from '@/store/userInfo';

interface UserInfoContextType {
  userInfo: {
    nickname: string;
    email: string;
    qq: string;
  };
  updateUserInfo: (info: Partial<{ nickname: string; email: string; qq: string }>) => void;
  clearUserInfo: () => void;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

export function UserInfoProvider({ children }: { children: ReactNode }) {
  const userInfo = useUserInfoStore();
  const setUserInfo = useUserInfoStore((state) => state.setUserInfo);
  const clearUserInfo = useUserInfoStore((state) => state.clearUserInfo);

  return (
    <UserInfoContext.Provider value={{ userInfo, updateUserInfo: setUserInfo, clearUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
}

// Hook for using the context
export function useUserInfo() {
  const context = useContext(UserInfoContext);
  if (context === undefined) {
    throw new Error('useUserInfo must be used within a UserInfoProvider');
  }
  return context;
}
