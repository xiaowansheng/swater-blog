import type { ApiResponse } from '@/types';

const API_BASE_URL = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  : 'http://localhost:8080';

export async function fetchClient<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();

  if (result.code !== 200) {
    throw new Error(result.message || 'Request failed');
  }

  return result.data;
}

