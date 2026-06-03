'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';
const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';

let currentTheme: Theme = 'light';
let initialized = false;

const listeners = new Set<(theme: Theme) => void>();

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

function getSystemTheme(): Theme {
  return window.matchMedia(THEME_MEDIA_QUERY).matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function notifyThemeListeners() {
  listeners.forEach((listener) => listener(currentTheme));
}

function initializeTheme(): Theme {
  if (typeof window === 'undefined') return currentTheme;

  if (!initialized) {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    currentTheme = isTheme(savedTheme) ? savedTheme : getSystemTheme();
    initialized = true;
  }

  applyTheme(currentTheme);
  return currentTheme;
}

function setGlobalTheme(theme: Theme, persist = true) {
  currentTheme = theme;

  if (typeof window !== 'undefined') {
    if (persist) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    applyTheme(theme);
  }

  notifyThemeListeners();
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const syncTheme = (nextTheme: Theme) => {
      setTheme(nextTheme);
    };

    const syncStoredTheme = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;

      const nextTheme = isTheme(event.newValue) ? event.newValue : getSystemTheme();
      currentTheme = nextTheme;
      applyTheme(nextTheme);
      notifyThemeListeners();
    };

    const syncSystemTheme = (event: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (isTheme(savedTheme)) return;

      currentTheme = event.matches ? 'dark' : 'light';
      applyTheme(currentTheme);
      notifyThemeListeners();
    };

    const mediaQuery = window.matchMedia(THEME_MEDIA_QUERY);

    listeners.add(syncTheme);
    syncTheme(initializeTheme());
    setMounted(true);

    window.addEventListener('storage', syncStoredTheme);
    mediaQuery.addEventListener('change', syncSystemTheme);

    return () => {
      listeners.delete(syncTheme);
      window.removeEventListener('storage', syncStoredTheme);
      mediaQuery.removeEventListener('change', syncSystemTheme);
    };
  }, []);

  const toggleTheme = () => {
    setGlobalTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme, mounted };
}
