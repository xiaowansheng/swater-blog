'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type LoadingListener = (loading: boolean) => void;

let globalLoading = false;
const listeners = new Set<LoadingListener>();
let timeoutId: NodeJS.Timeout | undefined;
let clickListenerAttached = false;

const notify = () => {
  listeners.forEach((listener) => listener(globalLoading));
};

const setGlobalLoading = (value: boolean, minDuration = 1000) => {
  globalLoading = value;
  notify();

  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  }

  if (value && minDuration > 0) {
    timeoutId = setTimeout(() => {
      globalLoading = false;
      notify();
      timeoutId = undefined;
    }, minDuration);
  }
};

const shouldStartLoadingFromClick = (event: MouseEvent) => {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const target = event.target as Element | null;
  const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
  if (!anchor) return false;

  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;

  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) return false;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash
    ) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
};

const ensureClickListener = () => {
  if (clickListenerAttached || typeof window === 'undefined') return;
  document.addEventListener(
    'click',
    (event) => {
      if (shouldStartLoadingFromClick(event)) {
        setGlobalLoading(true);
      }
    },
    true
  );
  clickListenerAttached = true;
};

export function useSimpleRouteLoading() {
  const [isLoading, setIsLoading] = useState(globalLoading);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const listener: LoadingListener = (loading) => {
      setIsLoading(loading);
    };

    listeners.add(listener);
    ensureClickListener();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (prevPathnameRef.current && prevPathnameRef.current !== pathname) {
      setGlobalLoading(true);
    }
    prevPathnameRef.current = pathname;
  }, [pathname]);

  const startLoading = (minDuration = 1000) => {
    setGlobalLoading(true, minDuration);
  };

  return { isLoading, startLoading };
}
