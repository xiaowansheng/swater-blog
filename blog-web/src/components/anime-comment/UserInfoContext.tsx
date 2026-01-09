'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserInfo {
  nickname: string;
  email: string;
  qq: string;
}

interface UserInfoContextType {
  userInfo: UserInfo;
  updateUserInfo: (info: Partial<UserInfo>) => void;
  clearUserInfo: () => void;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'comment_';

export function UserInfoProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    nickname: '',
    email: '',
    qq: '',
  });

  // 从localStorage加载用户信息
  useEffect(() => {
    const loadUserInfo = () => {
      const savedNickname = localStorage.getItem(`${STORAGE_KEY_PREFIX}nickname`);
      const savedEmail = localStorage.getItem(`${STORAGE_KEY_PREFIX}email`);
      const savedQQ = localStorage.getItem(`${STORAGE_KEY_PREFIX}qq`);

      if (savedNickname || savedEmail || savedQQ) {
        setUserInfo({
          nickname: savedNickname || '',
          email: savedEmail || '',
          qq: savedQQ || '',
        });
      }
    };

    loadUserInfo();
  }, []);

  // 更新用户信息
  const updateUserInfo = (info: Partial<UserInfo>) => {
    const newUserInfo = { ...userInfo, ...info };
    setUserInfo(newUserInfo);

    // 保存到localStorage
    if (info.nickname !== undefined) {
      if (info.nickname) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}nickname`, info.nickname);
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}nickname`);
      }
    }
    if (info.email !== undefined) {
      if (info.email) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}email`, info.email);
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}email`);
      }
    }
    if (info.qq !== undefined) {
      if (info.qq) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}qq`, info.qq);
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}qq`);
      }
    }
  };

  // 清除用户信息
  const clearUserInfo = () => {
    setUserInfo({
      nickname: '',
      email: '',
      qq: '',
    });
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}nickname`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}email`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}qq`);
  };

  return (
    <UserInfoContext.Provider value={{ userInfo, updateUserInfo, clearUserInfo }}>
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
