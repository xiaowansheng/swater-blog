import type { ApiResponse } from '@/types';
import { getMockResponse } from './mock';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function fetchServer<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const mockData = getMockResponse<T>(url, options);
  if (mockData !== null) {
    return mockData;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      // 在开发环境中增加超时时间，避免快速失败
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
  } catch (error: any) {
    // 如果是连接错误，提供更友好的错误信息
    if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      console.warn(`API server connection failed: ${API_BASE_URL}${url}`);
      throw error;
    }
    throw error;
  }
}

