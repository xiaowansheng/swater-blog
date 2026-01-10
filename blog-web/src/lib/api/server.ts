import type { ApiResponse } from '@/types';
import { getMockResponse } from './mock';
import { getVerifyToken, VERIFY_TOKEN_HEADER } from '../auth/emailSession';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function fetchServer<T>(url: string, options?: RequestInit): Promise<T> {
  const mockData = getMockResponse<T>(url, options);
  if (mockData !== null) {
    return mockData;
  }

  try {
    const verifyToken = getVerifyToken();
    const response = await fetch(`${API_BASE_URL}${url}`, {
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
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      console.warn(`API server connection failed: ${API_BASE_URL}${url}`);
      throw error;
    }
    throw error;
  }
}

