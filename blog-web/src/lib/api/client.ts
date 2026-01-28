import type { ApiResponse } from '@/types';
import { getMockResponse, createMockResponse } from './mock';
import toast from 'react-hot-toast';
import { getVerifyToken, VERIFY_TOKEN_HEADER } from '../auth/emailSession';

const API_BASE_URL = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_API_BASE_URL || ''
  : '';

function normalizeApiUrl(base: string, path: string) {
  const baseTrim = base.endsWith('/') ? base.slice(0, -1) : base;
  const pathTrim = path.startsWith('/') ? path : `/${path}`;
  if (baseTrim.endsWith('/api') && pathTrim.startsWith('/api/')) {
    return baseTrim + pathTrim.slice(4);
  }
  return baseTrim + pathTrim;
}

export async function fetchClient<T>(
  url: string,
  options?: RequestInit & { silent?: boolean }
): Promise<T> {
  const mockData = getMockResponse<T>(url, options);
  if (mockData !== null) {
    return mockData;
  }

  try {
    const verifyToken = getVerifyToken();
    const response = await fetch(normalizeApiUrl(API_BASE_URL, url), {
      ...options,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(verifyToken ? { [VERIFY_TOKEN_HEADER]: verifyToken } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorMessage = `HTTP error! status: ${response.status}`;
      if (!options?.silent) {
        toast.error(errorMessage);
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<T> = await response.json();

    if (result.code !== 200) {
      const errorMessage = result.message || 'Request failed';
      if (!options?.silent) {
        toast.error(errorMessage);
      }
      throw new Error(errorMessage);
    }

    return result.data;
  } catch (error) {
    // 如果是网络错误或其他未处理的错误
    if (error instanceof Error && !error.message.includes('HTTP error!') && !error.message.includes('Request failed')) {
      const errorMessage = '服务请求失败';
      // if (!options?.silent) {
      //   toast.error(errorMessage);
      // }
      throw new Error(errorMessage);
    }
    throw error;
  }
}

