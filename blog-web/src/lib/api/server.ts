import type { ApiResponse } from '@/types';
import { getMockResponse } from './mock';
import { getVerifyToken, VERIFY_TOKEN_HEADER } from '../auth/emailSession';

const CLIENT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:8888' : '/');
const SERVER_BASE_URL = process.env.SERVER_API_BASE_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:8888' : 'http://127.0.0.1:8888');

function resolveServerBaseUrl(base: string) {
  // Only rewrite relative base URLs when running on the server (SSR).
  // In the browser, a relative base like "/api" must stay relative to
  // avoid mixed-content and internal hostname leaks.
  return base;
}

const API_BASE_URL = resolveServerBaseUrl(SERVER_BASE_URL || CLIENT_BASE_URL);

function normalizeApiUrl(base: string, path: string) {
  const baseTrim = base.endsWith('/') ? base.slice(0, -1) : base;
  const pathTrim = path.startsWith('/') ? path : `/${path}`;
  if (baseTrim.endsWith('/api') && pathTrim.startsWith('/api/')) {
    return baseTrim + pathTrim.slice(4);
  }
  return baseTrim + pathTrim;
}

type NextFetchOptions = {
  tags?: string[];
  revalidate?: number;
};

export type FetchServerOptions = RequestInit & {
  next?: NextFetchOptions;
};

export async function fetchServer<T>(url: string, options?: FetchServerOptions): Promise<T> {
  const mockData = getMockResponse<T>(url, options);
  if (mockData !== null) {
    return mockData;
  }

  try {
    const verifyToken = getVerifyToken();
    const response = await fetch(normalizeApiUrl(API_BASE_URL, url), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(verifyToken ? { [VERIFY_TOKEN_HEADER]: verifyToken } : {}),
        ...options?.headers,
      },
      ...(process.env.NODE_ENV === 'development' ? { cache: 'no-store' } : {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();

    if (result.code !== 200) {
      throw new Error(result.message || 'Request failed');
    }

    return result.data;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
      console.warn(`API server connection failed: ${normalizeApiUrl(API_BASE_URL, url)}`);
      throw error;
    }
    throw error;
  }
}

