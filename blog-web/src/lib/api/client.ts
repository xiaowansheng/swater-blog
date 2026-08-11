import type { ApiResponse } from '@/types';
import { getMockResponse } from './mock';

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
import toast from 'react-hot-toast';
import { getVerifyToken, VERIFY_TOKEN_HEADER } from '../auth/emailSession';
import { normalizeApiUrl } from '@/lib/utils/apiUrl';

const API_BASE_URL = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8888' : '')
  : '';

export async function fetchClient<T>(
  url: string,
  options?: RequestInit & { silent?: boolean; timeout?: number }
): Promise<T> {
  const mockData = getMockResponse<T>(url, options);
  if (mockData !== null) {
    return mockData;
  }

  const timeout = options?.timeout ?? 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const verifyToken = getVerifyToken();
    const response = await fetch(normalizeApiUrl(API_BASE_URL, url), {
      ...options,
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(verifyToken ? { [VERIFY_TOKEN_HEADER]: verifyToken } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // 后端 GlobalExceptionHandler 把业务码映射为真实 HTTP 状态码，body 仍为标准 Result。
      // 优先用后端 message；解析失败再退回通用提示。
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorBody = (await response.clone().json()) as ApiResponse<unknown>;
        if (errorBody?.message) {
          errorMessage = errorBody.message;
        }
      } catch {
        // 非 JSON 响应，保留默认 message
      }
      if (!options?.silent) {
        toast.error(errorMessage);
      }
      throw new ApiError(errorMessage);
    }

    const result: ApiResponse<T> = await response.json();

    if (result.code !== 200) {
      const errorMessage = result.message || 'Request failed';
      if (!options?.silent) {
        toast.error(errorMessage);
      }
      throw new ApiError(errorMessage);
    }

    return result.data;
  } catch (error) {
    // 如果是我们自己抛出的业务错误，直接向外抛出，不要拦截或篡改
    if (error instanceof ApiError) {
      throw error;
    }

    // 请求超时（部分环境下 AbortError 不是 DOMException 实例，按 name 判断更稳妥）
    if ((error as Error)?.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }

    // fetch 抛出的网络错误通常是 TypeError (如 CORS、断网)
    // 或者是 JSON 解析错误等
    if (error instanceof TypeError) {
      throw new Error('网络请求失败，请检查您的网络或服务器状态');
    }

    // 对于其他未知错误，统一提示
    if (error instanceof Error) {
      throw new Error('服务请求失败');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
